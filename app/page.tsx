"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { hiragana, katakana, deckById } from "./data/flashcards";
import AppLink from "./components/AppLink";
import Flashcard from "./components/Flashcard";
import DeckControls, { type Mode } from "./components/DeckControls";
import { getServerSnapshot, getSnapshot, saveProgress, subscribe } from "./lib/progress";

/** A random permutation of `0..length - 1`. */
function shuffledOrder(length: number): number[] {
  const a = Array.from({ length }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  // Deck, position and shuffle order live in localStorage so a refresh picks up
  // where the last one left off.
  const { mode, index, order } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [seed, setSeed] = useState(0);

  const baseCards = useMemo(() => {
    if (mode === "kana-both") return [...hiragana, ...katakana];
    return deckById.get(mode)?.cards ?? [];
  }, [mode]);

  // A stored order can outlive the deck it was built for, so fall back to the
  // natural order unless it still lines up with the cards.
  const deck = useMemo(() => {
    if (!order || order.length !== baseCards.length) return baseCards;
    const reordered = order.map((i) => baseCards[i]);
    return reordered.every(Boolean) ? reordered : baseCards;
  }, [baseCards, order]);

  const handleModeChange = useCallback((m: Mode) => {
    saveProgress({ mode: m, index: 0, order: null });
    setSeed((s) => s + 1);
  }, []);

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
      />

      {card && (
        <Flashcard
          key={`${card.japanese}-${cardIndex}-${seed}`}
          card={card}
          current={cardIndex + 1}
          total={deck.length}
          onNext={() => saveProgress({ index: Math.min(cardIndex + 1, deck.length - 1) })}
          onPrev={() => saveProgress({ index: Math.max(cardIndex - 1, 0) })}
        />
      )}

      {cardIndex === deck.length - 1 && (
        <div className="text-white/60 text-sm animate-pulse">
          Deck complete! Shuffle or switch sets to continue.
        </div>
      )}
    </main>
  );
}
