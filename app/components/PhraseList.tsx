"use client";

import { useMemo, useState } from "react";
import { decks, type CardSet } from "../data/flashcards";

/** The phrasebook decks, in registry order — the sections offered in the menu. */
const sections = decks.filter((d) => d.group === "Travel Phrasebook");

/** A section id, plus the virtual section that lists every deck at once. */
type Section = CardSet | "all";

export default function PhraseList() {
  const [section, setSection] = useState<Section>("all");

  const shown = useMemo(
    () => (section === "all" ? sections : sections.filter((d) => d.id === section)),
    [section],
  );

  const total = useMemo(
    () => shown.reduce((sum, deck) => sum + deck.cards.length, 0),
    [shown],
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
        <option value="all" className="text-gray-900">
          All sections
        </option>
        {sections.map((deck) => (
          <option key={deck.id} value={deck.id} className="text-gray-900">
            {deck.label}
          </option>
        ))}
      </select>

      <p className="text-white/50 text-sm" aria-live="polite">
        {total} {total === 1 ? "phrase" : "phrases"}
      </p>

      {shown.map((deck) => (
        <section key={deck.id} className="w-full">
          <h2
            className={`text-xs font-semibold tracking-widest uppercase mb-2 px-1 ${deck.color}`}
          >
            {deck.label}
          </h2>
          <ul className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl overflow-hidden">
            {deck.cards.map((card, i) => (
              <li
                key={`${card.japanese}-${i}`}
                className="flex flex-col gap-1 border-b border-white/10 px-4 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="text-xl text-white font-light leading-snug break-words">
                    {card.japanese}
                  </p>
                  <p className="text-sm text-white/60 break-words">{card.romaji}</p>
                </div>
                <p className="text-sm sm:text-base text-white/80 break-words sm:shrink-0 sm:max-w-[45%] sm:text-right">
                  {card.english}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
