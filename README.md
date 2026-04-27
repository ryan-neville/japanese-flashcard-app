# Japanese Kana Flashcards

An interactive flashcard app for memorizing Japanese hiragana and katakana characters.

## Features

- **210 cards** — 105 hiragana and 105 katakana, covering all base characters and consonant combinations (kya, gyu, sho, etc.)
- **3D flip animation** — click or tap a card to reveal the romaji pronunciation
- **Swipe navigation** — swipe left/right on mobile to move through the deck
- **Shuffle** — randomizes card order using Fisher-Yates
- **Practice modes** — hiragana only, katakana only, or both combined
- **Progress indicator** — shows current position in the deck
- **Completion message** when you reach the end of a deck

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx          # Main flashcard UI
  layout.tsx        # Root layout and font setup
  data/
    flashcards.ts   # All 210 card definitions
  components/
    FlashCard.tsx   # Card component with flip animation
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
