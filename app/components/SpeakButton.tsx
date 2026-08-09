"use client";

import { hasClip, speakJapanese, useSpeech } from "../lib/speech";

interface Props {
  /** The Japanese to pronounce. */
  text: string;
  /** Stable identity for this phrase, so only the playing one animates. */
  phraseKey: string;
  /** Named in the button's label, so screen readers announce which phrase. */
  romaji?: string;
}

/**
 * Plays a phrase aloud in Japanese. Cards carry a bundled clip, which plays in
 * any engine; only text without one depends on the browser having a Japanese
 * voice, and there the button renders nothing rather than showing a control
 * that could never work.
 */
export default function SpeakButton({ text, phraseKey, romaji }: Props) {
  const { status, speakingKey } = useSpeech();

  // A clip needs no voice and no probing, so the button renders identically on
  // the server and the client. Without one we wait for the probe — "checking"
  // is the server's answer too, so both sides still match.
  const clip = hasClip(text);
  if (!clip && (status === "checking" || status === "unsupported")) return null;

  const speaking = speakingKey === phraseKey;
  const unavailable = !clip && status === "no-voice";
  const spoken = romaji ? `${text}, ${romaji}` : text;

  return (
    <button
      type="button"
      onClick={(e) => {
        // The rows are plain list items today, but keep the tap from reaching
        // any future row-level handler.
        e.stopPropagation();
        speakJapanese(text, phraseKey);
      }}
      disabled={unavailable}
      aria-label={
        unavailable
          ? `Pronunciation unavailable — no Japanese voice installed`
          : speaking
            ? `Stop playing ${spoken}`
            : `Play pronunciation of ${spoken}`
      }
      title={unavailable ? "No Japanese voice installed on this device" : "Play pronunciation"}
      className={`shrink-0 grid place-items-center h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/40 ${
        unavailable
          ? "border-white/10 text-white/25 cursor-not-allowed"
          : speaking
            ? "border-white/30 bg-white/25 text-white"
            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/20 hover:text-white active:bg-white/30"
      }`}
    >
      <SpeakerIcon speaking={speaking} muted={unavailable} />
    </button>
  );
}

/**
 * A speaker cone with two sound arcs. While speaking, the arcs pulse; the
 * animation is dropped for anyone who has asked for reduced motion, leaving the
 * button's filled background as the state cue.
 */
function SpeakerIcon({ speaking, muted }: { speaking: boolean; muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11 5 6.5 9H3.5v6h3L11 19z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="M15.5 9.5l5 5m0-5l-5 5" />
      ) : (
        <g className={speaking ? "motion-safe:animate-pulse" : ""}>
          <path d="M14.5 9.2a4 4 0 0 1 0 5.6" />
          <path d="M17.3 6.6a8 8 0 0 1 0 10.8" />
        </g>
      )}
    </svg>
  );
}
