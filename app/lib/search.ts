import type { Flashcard } from "../data/flashcards";

/**
 * Romaji in the decks is spelled inconsistently — "Onegaishimasu" is one word
 * while "Gomen nasai" is two, and long vowels are written out ("Arigatou").
 * People type what they hear, so matching the raw string would miss most of
 * those. Both the card text and the query are therefore folded down to a bare
 * consonant/vowel skeleton before comparing:
 *
 *   - lowercased, with accents dropped ("arigatō" → "arigato"), so a query
 *     pasted from a dictionary still matches;
 *   - punctuation, spaces and the "___" blanks removed, so "onegai shimasu",
 *     "onegaishimasu" and "Onegai-shimasu" are all the same string;
 *   - doubled vowels and the long-vowel "ou" collapsed, so "arigato" finds
 *     "Arigatou" and "yoroshiku" still finds "Yoroshiku".
 *
 * `normalize` is only ever applied to both sides, so the folding can be lossy
 * without making a search asymmetric.
 */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    // Strip combining marks (the macron in "ō", the accent in "é").
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/ou/g, "o")
    .replace(/([aeiou])\1+/g, "$1");
}

/**
 * Normalizing every card on every keystroke is cheap but repeated across a few
 * hundred cards and every render, so results are memoized by source string.
 * Card text is static, which keeps this bounded.
 */
const normalized = new Map<string, string>();

function normalizeCached(text: string): string {
  let value = normalized.get(text);
  if (value === undefined) {
    value = normalize(text);
    normalized.set(text, value);
  }
  return value;
}

/** A search query prepared once, then tested against many cards. */
export interface PhraseQuery {
  /** Lowercased, trimmed — matched literally against the English meaning. */
  english: string;
  /** Folded skeleton — matched against the romaji. Empty if the query folds away. */
  romaji: string;
}

export function parseQuery(raw: string): PhraseQuery | null {
  const english = raw.trim().toLowerCase();
  if (!english) return null;
  return { english, romaji: normalize(raw) };
}

/** True when the card matches on its English meaning or its romaji reading. */
export function matchesQuery(card: Flashcard, query: PhraseQuery): boolean {
  if ((card.english ?? "").toLowerCase().includes(query.english)) return true;
  return query.romaji !== "" && normalizeCached(card.romaji).includes(query.romaji);
}
