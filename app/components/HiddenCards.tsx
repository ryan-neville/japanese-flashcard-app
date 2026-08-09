"use client";

import { useState } from "react";
import type { Flashcard } from "../data/flashcards";

interface Props {
  /** Hidden cards belonging to the deck on screen, in deck order. */
  cards: Flashcard[];
  /** How many cards are hidden in the other decks, which this panel cannot reach. */
  otherCount: number;
  onUnhide: (card: Flashcard) => void;
  onUnhideAll: () => void;
}

export default function HiddenCards({ cards, otherCount, onUnhide, onUnhideAll }: Props) {
  const [open, setOpen] = useState(false);

  // Nothing hidden anywhere: the panel would only ever say "0", so leave it out.
  if (cards.length === 0 && otherCount === 0) return null;

  return (
    <div className="w-72 sm:w-96 flex flex-col items-center gap-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-4 py-2 min-h-[44px] rounded-lg bg-white/5 hover:bg-white/15 active:bg-white/20 text-white/70 text-sm font-medium transition-colors border border-white/10 touch-manipulation"
      >
        {cards.length} hidden in this deck{otherCount > 0 ? ` · ${otherCount} elsewhere` : ""}
        <span aria-hidden="true"> {open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="w-full flex flex-col gap-3">
          {cards.length === 0 ? (
            <p className="text-white/50 text-sm text-center">
              No cards are hidden in this deck.
            </p>
          ) : (
            <>
              <ul className="w-full rounded-2xl border border-white/20 bg-white/10 overflow-hidden">
                {cards.map((card) => (
                  <li
                    key={`${card.set}|${card.japanese}`}
                    className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-lg text-white font-light leading-snug break-words">
                        {card.japanese}
                      </p>
                      <p className="text-xs text-white/60 break-words">
                        {card.english ? `${card.romaji} — ${card.english}` : card.romaji}
                      </p>
                    </div>
                    <button
                      onClick={() => onUnhide(card)}
                      className="shrink-0 px-3 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
                      aria-label={`Unhide ${card.japanese}`}
                    >
                      Unhide
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={onUnhideAll}
                className="w-full px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
              >
                Unhide all in this deck
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
