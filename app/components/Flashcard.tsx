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

// Flip animation length, mirrored by `duration-500` on the rotating element.
const FLIP_MS = 500;
// Firefox renders elements with a backdrop-filter into their own group and stops
// honouring `backface-visibility: hidden`, so the front face shows through the
// back mirrored. Hide the away-facing side explicitly, swapped at the halfway
// point of the rotation so the change is invisible mid-flip.
const faceVisibility = (visible: boolean): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transition: `opacity 0s linear ${FLIP_MS / 2}ms`,
});

/** Kana, kanji and full-width punctuation — the glyphs that advance a whole em. */
const FULL_WIDTH = /[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]/u;

/** Width of a string in em, counting half-width ASCII as half a glyph. */
function emWidth(text: string): number {
  let em = 0;
  for (const ch of text) em += FULL_WIDTH.test(ch) ? 1 : 0.5;
  return em;
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
  // A phrase always reads as a single line: divide the width left over after the
  // face's padding by the phrase's width in em to get the largest size that still
  // fits, capped so short phrases stay display-sized. `cqw` measures the card
  // face, so one rule covers both the small and large card. Kana cards are a
  // glyph or two and keep their fixed oversized treatment.
  const frontSize = isPhrase ? "" : "text-8xl sm:text-9xl";
  const frontStyle: React.CSSProperties = isPhrase
    ? {
        whiteSpace: "nowrap",
        fontSize: `min(20cqw, calc((100cqw - 3.5rem) / ${emWidth(card.japanese)}))`,
      }
    : {};

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
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              // Makes `cqw` on the phrase text resolve against the card face.
              containerType: "inline-size",
              ...faceVisibility(!flipped),
            } as React.CSSProperties}
          >
            <span className={`text-xs font-semibold tracking-widest uppercase mb-4 ${setColor}`}>
              {setLabel}
            </span>
            <span
              className={`${frontSize} font-light text-white leading-tight text-center px-6`}
              style={frontStyle}
            >
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
              ...faceVisibility(flipped),
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
