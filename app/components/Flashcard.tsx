"use client";

import { useRef, useState } from "react";
import { deckById, type Flashcard as FlashcardType } from "../data/flashcards";

interface Props {
  card: FlashcardType;
  onNext: () => void;
  onPrev: () => void;
  current: number;
  total: number;
}

export default function Flashcard({ card, onNext, onPrev, current, total }: Props) {
  const [flipped, setFlipped] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const handleFlip = () => setFlipped((f) => !f);

  const handleNext = () => {
    setFlipped(false);
    onNext();
  };

  const handlePrev = () => {
    setFlipped(false);
    onPrev();
  };

  const handleCardClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    handleFlip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      didSwipe.current = true;
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  const deck = deckById.get(card.set);
  const setLabel = deck?.label ?? card.set;
  const setColor = deck?.color ?? "text-white/60";

  // Phrase cards carry an English meaning: the front shows the Japanese with its
  // romaji reading, and the flip side reveals the translation. Kana cards have no
  // English, so the front is the character alone and the flip reveals the romaji.
  const isPhrase = Boolean(card.english);
  // Long phrases need to shrink to fit the fixed-size card face.
  const frontSize =
    card.japanese.length > 16
      ? "text-3xl sm:text-4xl"
      : card.japanese.length > 8
        ? "text-4xl sm:text-5xl"
        : isPhrase
          ? "text-6xl sm:text-7xl"
          : "text-8xl sm:text-9xl";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm font-medium tracking-widest uppercase opacity-60">
        {current} / {total}
      </div>

      {/* Card */}
      <div
        className="relative w-72 h-72 sm:w-96 sm:h-96 cursor-pointer select-none touch-manipulation"
        style={{ perspective: "1000px", WebkitPerspective: "1000px" } as React.CSSProperties}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          } as React.CSSProperties}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-sm"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as React.CSSProperties}
          >
            <span className={`text-xs font-semibold tracking-widest uppercase mb-4 ${setColor}`}>
              {setLabel}
            </span>
            <span className={`${frontSize} font-light text-white leading-tight text-center px-6`}>
              {card.japanese}
            </span>
            {isPhrase && (
              <span className="mt-4 px-6 text-center text-lg sm:text-xl font-medium text-white/70">
                {card.romaji}
              </span>
            )}
            <span className="text-xs text-white/40 mt-6">tap to reveal</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-sm"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            } as React.CSSProperties}
          >
            <span className={`text-xs font-semibold tracking-widest uppercase mb-4 ${setColor}`}>
              {setLabel}
            </span>
            {isPhrase ? (
              <span className="px-6 text-center text-3xl sm:text-4xl font-semibold text-white leading-snug">
                {card.english}
              </span>
            ) : (
              <>
                <span className="text-6xl sm:text-7xl font-light text-white mb-4 leading-none">
                  {card.japanese}
                </span>
                <span className="text-4xl sm:text-5xl font-bold text-white/90 tracking-widest">
                  {card.romaji}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={handlePrev}
          className="px-6 py-3 min-h-[48px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium transition-colors border border-white/10 disabled:opacity-30 touch-manipulation"
          disabled={current === 1}
        >
          ← Prev
        </button>
        <button
          onClick={handleFlip}
          className="px-6 py-3 min-h-[48px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Flip
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 min-h-[48px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium transition-colors border border-white/10 disabled:opacity-30 touch-manipulation"
          disabled={current === total}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
