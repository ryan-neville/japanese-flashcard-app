"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  MAX_PLAYBACK_RATE,
  MIN_PLAYBACK_RATE,
  saveProgress,
  subscribe,
} from "../lib/progress";

/** Percent-point stops, fine enough to drag smoothly but landing exactly on
 *  round numbers like 25% or 50% without needing pixel-perfect precision. */
const STEP = 5;

/**
 * How fast pronunciation plays, from bundled clips and the Web Speech
 * fallback alike (see `speech.ts`). Self-contained rather than prop-drilled:
 * it is needed on both the flashcards page and the phrasebook, which share no
 * client component above the root layout, so it reads and writes the
 * `progress` store directly — the same store `SpeakButton` and `Flashcard`
 * already reach into independently.
 */
export default function PlaybackSpeedControl() {
  const { playbackRate } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const percent = Math.round(playbackRate * 100);

  return (
    <div className="flex items-center gap-3 min-h-[44px] w-72 sm:w-96 text-sm text-white/70">
      <label htmlFor="playback-speed" className="shrink-0">
        Speed
      </label>
      <div className="flex-1 flex items-center min-h-[44px]">
        <input
          id="playback-speed"
          type="range"
          min={Math.round(MIN_PLAYBACK_RATE * 100)}
          max={Math.round(MAX_PLAYBACK_RATE * 100)}
          step={STEP}
          value={percent}
          onChange={(e) => saveProgress({ playbackRate: Number(e.target.value) / 100 })}
          aria-label="Pronunciation playback speed"
          aria-valuetext={`${percent}%`}
          className="w-full touch-manipulation accent-white/80"
        />
      </div>
      <span className="w-11 text-right tabular-nums shrink-0">{percent}%</span>
    </div>
  );
}
