"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  decks,
  deckGroups,
  resolveCards,
  type CardSet,
  type Deck,
  type DeckGroup,
  type Flashcard,
} from "../data/flashcards";
import {
  cardKey,
  getServerSnapshot,
  getSnapshot,
  saveProgress,
  subscribe,
  toggleStar,
} from "../lib/progress";
import { getSection, getServerSection, saveSection, subscribeSection } from "../lib/section";
import { matchesQuery, parseQuery } from "../lib/search";
import PlaybackSpeedControl from "./PlaybackSpeedControl";
import SpeakButton from "./SpeakButton";

/** Every phrase deck, in registry order — the sections offered in the menu. */
const sections = decks.filter((d) => d.group !== "Kana");

/** The same sections split by deck group, so the section menu can label them. */
const sectionsByGroup: { group: DeckGroup; decks: Deck[] }[] = deckGroups
  .filter((group) => group !== "Kana")
  .map((group) => ({ group, decks: sections.filter((d) => d.group === group) }));

/** A section id, the virtual section that lists every deck, or the user's custom list. */
type Section = CardSet | "all" | "custom";

function isValidSection(value: string | null): value is Section {
  return value === "all" || value === "custom" || sections.some((d) => d.id === value);
}

/** The japanese/romaji/english text block shared by every row style. */
function PhraseText({ card }: { card: Flashcard }) {
  return (
    <div className="min-w-0 flex-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-xl text-white font-light leading-snug break-words">{card.japanese}</p>
        <p className="text-sm text-white/60 break-words">{card.romaji}</p>
      </div>
      <div className="sm:shrink-0 sm:max-w-[45%] sm:text-right">
        <p className="text-sm sm:text-base text-white/80 break-words">{card.english}</p>
        {card.detail && (
          <p className="text-xs text-white/50 break-words mt-0.5">{card.detail}</p>
        )}
      </div>
    </div>
  );
}

function StarButton({
  starred,
  onClick,
  label,
}: {
  starred: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={starred}
      aria-label={label}
      className={`shrink-0 px-3 py-2 min-h-[44px] rounded-lg text-lg transition-colors border border-white/10 touch-manipulation ${
        starred
          ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
          : "bg-white/10 hover:bg-white/20 text-white/70"
      }`}
    >
      {starred ? "★" : "☆"}
    </button>
  );
}

/** A "My List" row, draggable by its handle to set the manual study order. */
function CustomRow({ card, onRemove }: { card: Flashcard; onRemove: () => void }) {
  const key = cardKey(card);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: key,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border-b border-white/10 px-4 py-3 last:border-b-0 bg-white/5"
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
        aria-label={`Reorder ${card.japanese}`}
      >
        ⠿
      </button>
      <PhraseText card={card} />
      <SpeakButton text={card.japanese} romaji={card.romaji} phraseKey={key} />
      <StarButton starred onClick={onRemove} label={`Remove ${card.japanese} from My List`} />
    </li>
  );
}

export default function PhraseList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL wins when present (bookmarkable/shareable); otherwise fall back to
  // the last section stored locally, then to "all". `storedSection` needs no
  // live-update subscription — see subscribeSection — it only seeds this
  // derivation on a bare URL, since every user-driven change below updates the
  // URL directly rather than mirroring into local component state.
  const storedSection = useSyncExternalStore(subscribeSection, getSection, getServerSection);
  const urlSection = searchParams.get("section");
  const section: Section = isValidSection(urlSection)
    ? urlSection
    : isValidSection(storedSection)
      ? storedSection
      : "all";

  const [query, setQuery] = useState("");

  const setSection = useCallback(
    (next: Section) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("section", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // Keeps localStorage and the URL in sync with whatever section is showing,
  // so it's both remembered on a bare reload and bookmarkable/shareable. Built
  // from the live pathname (never a hardcoded "/phrasebook") since the app can
  // be mounted under a subpath — see AppLink's mountPath.
  useEffect(() => {
    saveSection(section);
    if (urlSection === section) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", section);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [section, urlSection, searchParams, pathname, router]);

  const { custom } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const customKeys = useMemo(() => new Set(custom), [custom]);
  const customCards = useMemo(() => resolveCards(custom), [custom]);

  const handleToggleStar = useCallback(
    (card: Flashcard) => {
      saveProgress({ custom: toggleStar(custom, card) });
    },
    [custom],
  );

  // null while the box is empty — every list below then skips filtering.
  const q = useMemo(() => parseQuery(query), [query]);

  const shownSections = useMemo(() => {
    if (section === "all") return sections;
    if (section === "custom") return [];
    return sections.filter((d) => d.id === section);
  }, [section]);

  const visibleSections = useMemo(() => {
    if (!q) return shownSections.map((deck) => ({ deck, cards: deck.cards }));
    return shownSections
      .map((deck) => ({
        deck,
        cards: deck.cards.filter((c) => matchesQuery(c, q)),
      }))
      .filter((entry) => entry.cards.length > 0);
  }, [shownSections, q]);

  const customFilteredCards = useMemo(
    () => (q ? customCards.filter((c) => matchesQuery(c, q)) : customCards),
    [customCards, q],
  );

  const total = useMemo(
    () =>
      section === "custom"
        ? customFilteredCards.length
        : visibleSections.reduce((sum, entry) => sum + entry.cards.length, 0),
    [section, visibleSections, customFilteredCards],
  );

  // Reordering a filtered subset against the full stored order is ambiguous,
  // so dragging is only offered with no search narrowing the list.
  const canReorder = section === "custom" && q === null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = custom.indexOf(String(active.id));
      const newIndex = custom.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      saveProgress({ custom: arrayMove(custom, oldIndex, newIndex) });
    },
    [custom],
  );

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      {/* Section selector */}
      <select
        value={section}
        onChange={(e) => setSection(e.target.value as Section)}
        className="min-h-[44px] w-72 sm:w-96 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 touch-manipulation"
        aria-label="Choose a phrasebook section"
      >
        <option value="custom" className="text-gray-900">
          My List{custom.length > 0 ? ` (${custom.length})` : ""}
        </option>
        <option value="all" className="text-gray-900">
          All sections
        </option>
        {sectionsByGroup.map(({ group, decks: groupDecks }) => (
          <optgroup key={group} label={group} className="text-gray-900">
            {groupDecks.map((deck) => (
              <option key={deck.id} value={deck.id} className="text-gray-900">
                {deck.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Search — English meaning or romaji reading */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search phrases (English or romaji)"
        aria-label="Search phrases by English meaning or romaji"
        className="min-h-[44px] w-72 sm:w-96 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 touch-manipulation"
      />

      <PlaybackSpeedControl />

      <p className="text-white/50 text-sm" aria-live="polite">
        {total} {total === 1 ? "phrase" : "phrases"}
      </p>

      {section === "custom" ? (
        customFilteredCards.length === 0 ? (
          <p className="text-white/50 text-sm text-center max-w-xs">
            {custom.length === 0
              ? "Star cards while studying or browsing to build your list."
              : "No starred phrases match your search."}
          </p>
        ) : (
          <section className="w-full">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-2 px-1 text-white/60">
              My List
            </h2>
            {!canReorder && q !== null && (
              <p className="text-white/40 text-xs mb-2 px-1">Clear search to reorder.</p>
            )}
            <ul className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl overflow-hidden">
              {canReorder ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={customFilteredCards.map(cardKey)}
                    strategy={verticalListSortingStrategy}
                  >
                    {customFilteredCards.map((card) => (
                      <CustomRow
                        key={cardKey(card)}
                        card={card}
                        onRemove={() => handleToggleStar(card)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                customFilteredCards.map((card) => (
                  <li
                    key={cardKey(card)}
                    className="flex items-center gap-3 border-b border-white/10 px-4 py-3 last:border-b-0"
                  >
                    <PhraseText card={card} />
                    <SpeakButton text={card.japanese} romaji={card.romaji} phraseKey={cardKey(card)} />
                    <StarButton
                      starred
                      onClick={() => handleToggleStar(card)}
                      label={`Remove ${card.japanese} from My List`}
                    />
                  </li>
                ))
              )}
            </ul>
          </section>
        )
      ) : (
        visibleSections.map(({ deck, cards }) => (
          <section key={deck.id} className="w-full">
            <h2
              className={`text-xs font-semibold tracking-widest uppercase mb-2 px-1 ${deck.color}`}
            >
              {deck.label}
            </h2>
            <ul className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl overflow-hidden">
              {cards.map((card, i) => {
                const key = cardKey(card);
                const starred = customKeys.has(key);
                return (
                  <li
                    key={`${card.japanese}-${i}`}
                    className="flex items-center gap-3 border-b border-white/10 px-4 py-3 last:border-b-0"
                  >
                    <PhraseText card={card} />
                    <StarButton
                      starred={starred}
                      onClick={() => handleToggleStar(card)}
                      label={
                        starred
                          ? `Remove ${card.japanese} from My List`
                          : `Add ${card.japanese} to My List`
                      }
                    />
                    <SpeakButton text={card.japanese} romaji={card.romaji} phraseKey={key} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
