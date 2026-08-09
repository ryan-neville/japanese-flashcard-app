// Lists every distinct Japanese string in the decks, so the audio generator and
// the app agree on exactly what needs a clip. Imports the real deck module
// rather than re-parsing it, so adding a card can never silently miss audio.
//
//   node scripts/extract-phrases.mjs > scripts/phrases.json
//
// Requires Node 22.6+ (TypeScript type stripping).
import { decks } from "../app/data/flashcards.ts";

const texts = [...new Set(decks.flatMap((deck) => deck.cards.map((card) => card.japanese)))];

process.stdout.write(JSON.stringify(texts, null, 2) + "\n");
