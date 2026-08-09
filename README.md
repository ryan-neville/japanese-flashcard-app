# Japanese Kana Flashcards

An interactive flashcard app for memorizing Japanese hiragana, katakana, and travel/menu phrases.

## Features

- **412 cards across 20 decks** — 208 kana characters plus 204 phrases
- **Kana decks** — 104 hiragana and 104 katakana, covering all base characters and consonant combinations (kya, gyu, sho, etc.)
- **Travel Phrasebook** — Greetings & Basics, Getting Around, Dining, Shopping, Hotel, Emergencies & Health, Useful Everyday Phrases, Numbers
- **Menu Guide** — Alcoholic & Non-Alcoholic Drinks, Appetizers & Sides, Sushi & Sashimi, Noodles, Rice Dishes, Grilled & Fried Mains, Hot Pot & Stews, Soups, Dessert
- **3D flip animation** — click or tap a card to reveal the answer
- **Two card styles** — kana cards show the character and flip to reveal romaji; phrase cards show Japanese *and* romaji together, flipping to reveal the English translation
- **Swipe navigation** — swipe left/right on mobile to move through the deck
- **Shuffle** — randomizes card order using Fisher-Yates
- **Progress indicator** — shows current position in the deck
- **Completion message** when you reach the end of a deck

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing on your phone

```bash
npm run dev:lan
```

Then browse to `http://<your-lan-ip>:3002` from a device on the same Wi-Fi. Find your IP with:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' }
```

> The `Network: http://0.0.0.0:3002` line Next prints is the *bind address*, not a reachable URL. `0.0.0.0` means "all interfaces" — phones need the actual LAN IP.

If the phone still can't connect, check in this order: the server is actually running (see below), the phone is on Wi-Fi rather than cellular, and the SSID isn't a guest network with AP/client isolation enabled.

## Project Structure

```
app/
  page.tsx              # Main flashcard UI and deck selection state
  layout.tsx            # Root layout and font setup
  data/
    flashcards.ts       # All card data, deck registry, and types
  components/
    Flashcard.tsx       # Card component with flip animation
    DeckControls.tsx    # Deck picker, shuffle, restart
```

### Adding a deck

Decks live in [`app/data/flashcards.ts`](app/data/flashcards.ts). Add an id to the `PhraseSet` union, build the cards with the `phraseDeck()` helper, then register it in the `decks` array. The UI reads from that registry, so no component changes are needed.

Then run `npm run audio` to render clips for the new cards — see below.

### Pronunciation audio

Every card has a pre-rendered clip in `public/audio/ja/`, looked up through the generated `app/data/audio-manifest.ts`. These are committed on purpose.

They exist because the Web Speech API cannot carry this on its own: **Firefox ships no voices of its own** and can only speak with one installed in the OS, so a machine without a Japanese speech pack has no Japanese voice at all. On Windows it is worse than it sounds — the packs install under the `Speech_OneCore` registry hive, which Firefox does not read. Chrome and Edge hide the problem by bundling their own voices, which is why the feature can look fine in testing and be silent in Firefox. The clips play identically in all four engines and need no OS support. Web Speech is kept only as a fallback for text with no clip.

To regenerate after adding or editing cards:

```bash
pip install edge-tts   # once
npm run audio          # renders only the clips that are missing
```

The generator is a network call to Microsoft's TTS endpoint at authoring time; the app itself never talks to a third party. Pass `--force` to `scripts/generate-audio.py` to re-render everything, which is needed if you change `VOICE`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run dev:lan` | Start dev server on port 3002, reachable from other devices on the LAN |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run audio` | Render any missing pronunciation clips and rewrite the audio manifest |

---

## Troubleshooting

Nearly every issue below has one root cause: **`next dev` and `next build` both own the `.next` directory and cannot share it.** Two Next processes pointed at the same `.next` will corrupt each other.

### Avoid the problem entirely

**1. Run Next directly instead of through npm.**

```powershell
npx next dev -H 0.0.0.0 -p 3002
```

On Windows, `npm run` spawns a chain of processes and does not reliably forward Ctrl-C to them. Invoking `next` directly means Ctrl-C reaches the dev server itself, which shuts its workers down cleanly. This single change prevents most of the failures below.

**2. Stop the dev server before running `npm run build`.** There is no cache worth preserving — `build` clears `.next` anyway.

**3. Give each project its own port.** Running two apps on the default 3000 invites collisions.

### Ctrl-C doesn't actually stop the server

`npm run dev:lan` spawns a process chain: the npm wrapper, the `next` CLI, `start-server.js` (which owns the port), and a PostCSS worker that runs from a file *inside* `.next`.

Ctrl-C often kills only the npm wrapper and returns your prompt — so it **looks** stopped — while the server keeps the port and the PostCSS worker keeps `.next` locked.

**Kill whatever owns the port** (always correct, and precise):

```powershell
Stop-Process -Id (Get-NetTCPConnection -State Listen -LocalPort 3002).OwningProcess -Force
```

**Then sweep any stragglers for this project only:**

```powershell
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -like '*japanese-flashcard-app*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

**Always verify** before building:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3002 -ErrorAction SilentlyContinue
```

No output means it is genuinely stopped.

> Avoid `Get-Process node | Stop-Process -Force` — it kills node for *every* project, not just this one. Note also that the npm wrapper process does not contain the project path in its command line, so path-based filters miss it. Killing by port is the reliable tool.

### `Error: EPERM: operation not permitted, unlink '...\.next\static\...'`

A dev server (or its orphaned PostCSS worker) still has `.next` open, so `build` cannot delete files there. Windows surfaces the lock as `EPERM`.

1. Stop the dev server and verify with the commands above
2. Delete the half-wiped directory: `Remove-Item -Recurse -Force .next`
3. Build again

### `Error: Cannot find module './682.js'`

The `.next` build cache is stale or corrupt — `webpack-runtime.js` references a chunk that no longer exists on disk. This happens when two Next processes write to the same `.next`, for example a dev server and a production server running at once.

It often surfaces first on a 404 route, because `_not-found` is the page that demands the missing chunk.

```powershell
# stop every Next process for this project, then:
Remove-Item -Recurse -Force .next
npm run dev
```

Then start **one** server, not two.

### Running dev and a production build simultaneously

If you genuinely need both at once, give them separate output directories in `next.config.ts` so they never contend:

```ts
distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
```

### A note on OneDrive

This project lives under `OneDrive\Documents\GitHub`. OneDrive syncs `.next` regardless of `.gitignore`, and can lock or relocate files mid-write — producing the same missing-chunk and `EPERM` symptoms independently of anything above. If these errors recur with only one server running, that is the likely culprit; the durable fix is moving the repo outside OneDrive.
