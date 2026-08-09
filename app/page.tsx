"use client";

import { useState, useCallback, useMemo } from "react";
import { hiragana, katakana, deckById } from "./data/flashcards";
import Flashcard from "./components/Flashcard";
import DeckControls, { type Mode } from "./components/DeckControls";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("hiragana");
  const [shuffled, setShuffled] = useState(false);
  const [index, setIndex] = useState(0);
  const [seed, setSeed] = useState(0);

  const baseCards = useMemo(() => {
    if (mode === "kana-both") return [...hiragana, ...katakana];
    return deckById.get(mode)?.cards ?? [];
  }, [mode]);

  const deck = useMemo(() => {
    void seed;
    return shuffled ? shuffle(baseCards) : baseCards;
  }, [baseCards, shuffled, seed]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setIndex(0);
    setSeed((s) => s + 1);
  }, []);

  const handleShuffle = useCallback(() => {
    setShuffled(true);
    setIndex(0);
    setSeed((s) => s + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setShuffled(false);
    setIndex(0);
    setSeed((s) => s + 1);
  }, []);

  const card = deck[index];

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

      <DeckControls
        mode={mode}
        onModeChange={handleModeChange}
        onShuffle={handleShuffle}
        onRestart={handleRestart}
      />

      {card && (
        <Flashcard
          key={`${card.japanese}-${index}-${seed}`}
          card={card}
          current={index + 1}
          total={deck.length}
          onNext={() => setIndex((i) => Math.min(i + 1, deck.length - 1))}
          onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
        />
      )}

      {index === deck.length - 1 && (
        <div className="text-white/60 text-sm animate-pulse">
          Deck complete! Shuffle or switch sets to continue.
        </div>
      )}
    </main>
  );
}
