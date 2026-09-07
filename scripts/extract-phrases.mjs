// Lists every distinct Japanese string in the decks, so the audio generator and
// the app agree on exactly what needs a clip. Imports the real deck module
// rather than re-parsing it, so adding a card can never silently miss audio.
//
// Pairs each phrase with its romaji, not just the Japanese text: a "/" in the
// Japanese sometimes joins two spellings of one identical word (鮪 / マグロ,
// both "maguro") and sometimes joins two genuinely different words (肉なし /
// ベジタリアン). The romaji is what tells generate-audio.py which case it is —
// see speech_source() there.
//
//   node scripts/extract-phrases.mjs > scripts/phrases.json
//
// Requires Node 22.6+ (TypeScript type stripping).
import { decks } from "../app/data/flashcards.ts";

const byJapanese = new Map();
for (const deck of decks) {
  for (const card of deck.cards) {
    if (!byJapanese.has(card.japanese)) byJapanese.set(card.japanese, card.romaji);
  }
}

const phrases = [...byJapanese].map(([japanese, romaji]) => ({ japanese, romaji }));

process.stdout.write(JSON.stringify(phrases, null, 2) + "\n");
