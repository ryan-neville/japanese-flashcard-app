"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  hiragana,
  katakana,
  deckById,
  resolveCards,
  type Flashcard as FlashcardType,
} from "./data/flashcards";
import AppLink from "./components/AppLink";
import Flashcard from "./components/Flashcard";
import HiddenCards from "./components/HiddenCards";
import DeckControls, { type Mode } from "./components/DeckControls";
import {
  cardKey,
  clearProgress,
  DEFAULT_PROGRESS,
  getServerSnapshot,
  getSnapshot,
  isMode,
  saveProgress,
  subscribe,
  toggleStar,
} from "./lib/progress";

/** A random permutation of `0..length - 1`. */
function shuffledOrder(length: number): number[] {
  const a = Array.from({ length }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FlashcardsView() {
  // Deck, position and shuffle order live in localStorage so a refresh picks up
  // where the last one left off.
  const { mode, index, order, hidden, custom, englishFirst } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [seed, setSeed] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlDeck = searchParams.get("deck");

  // The deck value from the URL that's already been dealt with — either we
  // wrote it ourselves (setDeckUrl) or we already adopted it into storage.
  // Deliberately keyed on urlDeck ALONE (never compared against `mode`): two
  // independent async processes update `mode` (a synchronous localStorage
  // write) and `urlDeck` (a router transition that resolves on its own
  // schedule, which — per AGENTS.md — can differ enough between engines that
  // Chrome and Firefox don't necessarily interleave the same way). Comparing
  // them against each other made the correctness of this code depend on
  // which one happened to update first on a given render; tracking "have I
  // already accounted for this exact urlDeck value" does not.
  const syncedUrlDeck = useRef<string | null>(null);

  const setDeckUrl = useCallback(
    (m: Mode) => {
      syncedUrlDeck.current = m;
      const params = new URLSearchParams(searchParams.toString());
      params.set("deck", m);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // A bookmarked or shared `?deck=` URL switches to that deck. This is the
  // only place that adopts a URL value INTO storage; every place that changes
  // the deck the other way goes through setDeckUrl, which pre-marks the value
  // as synced so this effect never re-examines its own writes. getSnapshot()
  // is read fresh rather than trusting the `mode` this component was passed,
  // since that can still be the pre-hydration default for a render or two.
  useEffect(() => {
    if (!urlDeck || !isMode(urlDeck) || urlDeck === syncedUrlDeck.current) return;
    syncedUrlDeck.current = urlDeck;
    if (urlDeck !== getSnapshot().mode) {
      saveProgress({ mode: urlDeck, index: 0, order: null });
    }
  }, [urlDeck]);

  // A bare URL with no `deck` param at all (a fresh mount — e.g. navigating
  // over from the Phrasebook) gets one filled in from the actual stored deck.
  // Built from the live pathname (never a hardcoded "/") since the app can be
  // mounted under a subpath — see AppLink's mountPath.
  useEffect(() => {
    if (urlDeck !== null) return;
    setDeckUrl(getSnapshot().mode);
  }, [urlDeck, setDeckUrl]);

  const customCards = useMemo(() => resolveCards(custom), [custom]);

  const baseCards = useMemo(() => {
    if (mode === "kana-both") return [...hiragana, ...katakana];
    if (mode === "custom") return customCards;
    return deckById.get(mode)?.cards ?? [];
  }, [mode, customCards]);

  const hiddenKeys = useMemo(() => new Set(hidden), [hidden]);
  const customKeys = useMemo(() => new Set(custom), [custom]);

  // A stored order can outlive the deck it was built for, so fall back to the
  // natural order unless it still lines up with the cards.
  const ordered = useMemo(() => {
    if (!order || order.length !== baseCards.length) return baseCards;
    const reordered = order.map((i) => baseCards[i]);
    return reordered.every(Boolean) ? reordered : baseCards;
  }, [baseCards, order]);

  // Hidden cards drop out of the rotation but keep their place in `order`, so
  // hiding and unhiding a card does not disturb the shuffle around it.
  const deck = useMemo(
    () => ordered.filter((c) => !hiddenKeys.has(cardKey(c))),
    [ordered, hiddenKeys],
  );

  const hiddenInDeck = useMemo(
    () => baseCards.filter((c) => hiddenKeys.has(cardKey(c))),
    [baseCards, hiddenKeys],
  );

  const handleHide = useCallback(
    (card: FlashcardType) => {
      const key = cardKey(card);
      if (hiddenKeys.has(key)) return;
      saveProgress({ hidden: [...hidden, key] });
    },
    [hidden, hiddenKeys],
  );

  const handleUnhide = useCallback(
    (card: FlashcardType) => {
      const key = cardKey(card);
      saveProgress({ hidden: hidden.filter((k) => k !== key) });
    },
    [hidden],
  );

  const handleUnhideDeck = useCallback(() => {
    const deckKeys = new Set(baseCards.map(cardKey));
    saveProgress({ hidden: hidden.filter((k) => !deckKeys.has(k)) });
  }, [baseCards, hidden]);

  const handleClear = useCallback(() => {
    clearProgress();
    setSeed((s) => s + 1);
    setDeckUrl(DEFAULT_PROGRESS.mode);
  }, [setDeckUrl]);

  const handleToggleStar = useCallback(
    (card: FlashcardType) => {
      saveProgress({ custom: toggleStar(custom, card) });
    },
    [custom],
  );

  const handleToggleEnglishFirst = useCallback(() => {
    saveProgress({ englishFirst: !englishFirst });
  }, [englishFirst]);

  const handleModeChange = useCallback(
    (m: Mode) => {
      saveProgress({ mode: m, index: 0, order: null });
      setSeed((s) => s + 1);
      setDeckUrl(m);
    },
    [setDeckUrl],
  );

  const handleShuffle = useCallback(() => {
    saveProgress({ index: 0, order: shuffledOrder(baseCards.length) });
    setSeed((s) => s + 1);
  }, [baseCards.length]);

  const handleRestart = useCallback(() => {
    saveProgress({ index: 0, order: null });
    setSeed((s) => s + 1);
  }, []);

  // A restored index can point past a deck that has since shrunk.
  const cardIndex = Math.min(index, Math.max(deck.length - 1, 0));
  const card = deck[cardIndex];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-4 py-12 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
          日本語 Flashcards
        </h1>
        <p className="text-white/50 text-sm">
          {mode === "kana-both"
            ? "Japanese kana practice"
            : mode === "custom"
              ? "Your custom list"
              : (deckById.get(mode)?.subtitle ?? "Japanese practice")}
        </p>
      </div>

      <AppLink
        to="/phrasebook"
        className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
      >
        Phrasebook →
      </AppLink>

      <DeckControls
        mode={mode}
        onModeChange={handleModeChange}
        onShuffle={handleShuffle}
        onRestart={handleRestart}
        onClear={handleClear}
        customCount={custom.length}
        englishFirst={englishFirst}
        onToggleEnglishFirst={handleToggleEnglishFirst}
      />

      {card ? (
        <Flashcard
          key={`${mode}-${card.japanese}-${cardIndex}-${seed}`}
          card={card}
          current={cardIndex + 1}
          total={deck.length}
          onNext={() => saveProgress({ index: Math.min(cardIndex + 1, deck.length - 1) })}
          onPrev={() => saveProgress({ index: Math.max(cardIndex - 1, 0) })}
          onHide={() => handleHide(card)}
          isStarred={customKeys.has(cardKey(card))}
          onToggleStar={() => handleToggleStar(card)}
          englishFirst={englishFirst}
        />
      ) : (
        <p className="text-white/60 text-sm text-center max-w-xs">
          {mode === "custom" && customCards.length === 0
            ? "Your list is empty. Star cards while studying or browsing the phrasebook to add them here."
            : "Every card in this set is hidden. Unhide one below, or pick another set."}
        </p>
      )}

      <HiddenCards
        cards={hiddenInDeck}
        otherCount={hidden.length - hiddenInDeck.length}
        onUnhide={handleUnhide}
        onUnhideAll={handleUnhideDeck}
      />

      {deck.length > 0 && cardIndex === deck.length - 1 && (
        <div className="text-white/60 text-sm animate-pulse">
          Deck complete! Shuffle or switch sets to continue.
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <FlashcardsView />
    </Suspense>
  );
}
