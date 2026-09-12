import { cardKey, deckById, type CardSet, type Flashcard } from "../data/flashcards";
import type { Mode } from "../components/DeckControls";

export { cardKey } from "../data/flashcards";

const STORAGE_KEY = "japanese-flashcards:progress";

/**
 * The slice of state that survives a refresh: the chosen deck, the position in
 * it, the shuffle order, the cards hidden from rotation, the user's custom
 * cross-deck list, and the flip-order preference. The shuffle order is stored
 * as a permutation of the deck's indices — without it a reload would reshuffle
 * and the saved position would land on an unrelated card.
 */
export interface Progress {
  mode: Mode;
  index: number;
  order: number[] | null;
  /** `cardKey` of every hidden card, across all decks. */
  hidden: string[];
  /** `cardKey` of every card starred into "My List", in the user's chosen order. */
  custom: string[];
  /** Shows the English side of a phrase card before the Japanese side. */
  englishFirst: boolean;
  /** Pronunciation playback speed, as a fraction of normal speed (1 = normal). */
  playbackRate: number;
}

export const DEFAULT_PROGRESS: Progress = {
  mode: "hiragana",
  index: 0,
  order: null,
  hidden: [],
  custom: [],
  englishFirst: false,
  playbackRate: 1,
};

/** The slowest and fastest pace the playback speed control allows. */
export const MIN_PLAYBACK_RATE = 0.25;
export const MAX_PLAYBACK_RATE = 1;

function isPlaybackRate(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MIN_PLAYBACK_RATE &&
    value <= MAX_PLAYBACK_RATE
  );
}

export function isMode(value: unknown): value is Mode {
  return (
    value === "kana-both" ||
    value === "custom" ||
    (typeof value === "string" && deckById.has(value as CardSet))
  );
}

/** Adds `key` to `list` if absent, removes it if present. */
export function toggleCustomKey(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

/** Stars or unstars `card` in the custom list — the one place Flashcards and
 * the Phrasebook both toggle "My List" membership, so future changes (a size
 * cap, a dedup guard, analytics) only need to happen here. */
export function toggleStar(current: string[], card: Flashcard): string[] {
  return toggleCustomKey(current, cardKey(card));
}

/** Reads stored progress, keeping only the fields that still make sense. */
function parse(raw: string): Progress {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_PROGRESS;
  }
  if (typeof parsed !== "object" || parsed === null) return DEFAULT_PROGRESS;
  const { mode, index, order, hidden, custom, englishFirst, playbackRate } =
    parsed as Record<string, unknown>;
  return {
    mode: isMode(mode) ? mode : DEFAULT_PROGRESS.mode,
    index: Number.isInteger(index) && (index as number) >= 0 ? (index as number) : 0,
    order: Array.isArray(order) && order.every((n) => Number.isInteger(n)) ? (order as number[]) : null,
    hidden: Array.isArray(hidden) ? hidden.filter((k): k is string => typeof k === "string") : [],
    custom: Array.isArray(custom) ? custom.filter((k): k is string => typeof k === "string") : [],
    englishFirst: typeof englishFirst === "boolean" ? englishFirst : DEFAULT_PROGRESS.englishFirst,
    playbackRate: isPlaybackRate(playbackRate) ? playbackRate : DEFAULT_PROGRESS.playbackRate,
  };
}

// getSnapshot must return the same object while the underlying data is
// unchanged, or React re-renders forever — so the last parse is cached against
// the raw string it came from.
let cache: { raw: string | null; value: Progress } = { raw: null, value: DEFAULT_PROGRESS };

const listeners = new Set<() => void>();

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // `storage` only fires in *other* tabs; same-tab writes notify directly.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getSnapshot(): Progress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): behave as though nothing was saved.
  }
  if (raw !== cache.raw) cache = { raw, value: raw === null ? DEFAULT_PROGRESS : parse(raw) };
  return cache.value;
}

/** The server has no storage to read, so it always renders a fresh deck. */
export function getServerSnapshot(): Progress {
  return DEFAULT_PROGRESS;
}

export function saveProgress(patch: Partial<Progress>): void {
  const next: Progress = { ...getSnapshot(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: progress just won't survive the refresh.
  }
  for (const listener of listeners) listener();
}

/** Forgets every saved preference — deck, position, shuffle order and hidden cards. */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: there was nothing persisted to clear.
  }
  for (const listener of listeners) listener();
}
