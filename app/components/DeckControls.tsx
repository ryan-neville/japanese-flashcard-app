"use client";

import { decks, deckGroups, type CardSet, type DeckGroup } from "../data/flashcards";

/** A deck id, plus the virtual deck that merges both kana sets. */
export type Mode = CardSet | "kana-both";

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onShuffle: () => void;
  onRestart: () => void;
}

const optionsByGroup: { group: DeckGroup; options: { value: Mode; label: string }[] }[] =
  deckGroups.map((group) => ({
    group,
    options: [
      ...decks
        .filter((d) => d.group === group)
        .map((d) => ({ value: d.id as Mode, label: d.label })),
      ...(group === "Kana" ? [{ value: "kana-both" as Mode, label: "Both kana" }] : []),
    ],
  }));

export default function DeckControls({ mode, onModeChange, onShuffle, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Deck selector */}
      <select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as Mode)}
        className="min-h-[44px] w-72 sm:w-96 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 touch-manipulation"
        aria-label="Choose a deck"
      >
        {optionsByGroup.map(({ group, options }) => (
          <optgroup key={group} label={group} className="text-gray-900">
            {options.map((o) => (
              <option key={o.value} value={o.value} className="text-gray-900">
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onShuffle}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Shuffle
        </button>
        <button
          onClick={onRestart}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
