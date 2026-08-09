<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Browser compatibility

Every change must work in current Chrome, Edge, Firefox, and Safari on desktop, and in Safari on iOS and Chrome on Android. Treat Firefox and iOS Safari as first-class targets, not afterthoughts — they are where this app has actually broken before. A change that only renders correctly in Chrome is not done.

## Before writing code

Check support for any CSS property, selector, or web API you are about to introduce. If it is newer than roughly the last two years, or if support differs across the four engines (Blink, Gecko, WebKit), either pick an older equivalent or add a fallback. Do not assume a feature is safe because it is common in Chrome-first code.

## CSS and layout

- **3D transforms**: keep the `-webkit-` prefixed twin alongside every `perspective`, `transform-style`, and `backface-visibility` — older iOS Safari needs it. See [Flashcard.tsx:111-160](app/components/Flashcard.tsx#L111-L160).
- **`backface-visibility` is not reliable in Firefox**: Gecko promotes elements with `backdrop-filter` into their own rendering group and stops honouring it, so a flipped face shows through mirrored. Drive face visibility with `opacity` instead, as [Flashcard.tsx:16-23](app/components/Flashcard.tsx#L16-L23) does. Any new flip, fold, or card-stack effect needs the same treatment.
- **Viewport height**: `100vh` is wrong on mobile Safari (it excludes the collapsing toolbar and clips content). Use `100dvh`, or flex from `min-h-full` on `<body>` as [layout.tsx:30](app/layout.tsx#L30) does.
- **`backdrop-filter`**: still expensive and imperfectly composited in Firefox. Always pair it with a solid or translucent background colour so the surface stays legible if the blur is dropped.
- **Container queries** (`container-type`, `cqw`) and `:has()` are supported across all four engines and are fine to use; `@container style()` queries and `field-sizing` are not — avoid them.
- Do not ship `-moz-`-only or `-webkit-`-only styling as the sole implementation of anything load-bearing.

## Touch and pointer input

- Anything tappable needs a **minimum 44×44 px hit area** (`min-h-[48px]` is the convention here) and `touch-manipulation` to suppress the iOS 300 ms double-tap-zoom delay.
- Pair every hover affordance with an `active:` state — mobile browsers have no hover, and iOS Safari leaves sticky `:hover` styles behind after a tap.
- Custom swipe or drag gestures must guard against the click that fires after the gesture ends (the `didSwipe` ref in [Flashcard.tsx:53-79](app/components/Flashcard.tsx#L53-L79)), and must not `preventDefault` on `touchstart` in a way that kills native scrolling.
- Keep keyboard equivalents for any gesture-only interaction — desktop Firefox and Safari users have no touchscreen.
- If a `viewport` export is added to [layout.tsx](app/layout.tsx), never set `maximum-scale` or `user-scalable=no`; blocking pinch-zoom is an accessibility regression.

## JavaScript and web APIs

- Guard browser-only APIs behind a `typeof window !== "undefined"` check — this app server-renders, and `localStorage`, `matchMedia`, and `navigator` do not exist during SSR.
- Wrap `localStorage` reads and writes in `try/catch`. Safari Private Browsing and iOS storage pressure make them throw, and an uncaught throw takes the whole render down. [app/lib/progress.ts](app/lib/progress.ts) is the pattern to follow.
- Feature-detect before use rather than sniffing user agents: `if ("vibrate" in navigator)`, `if (window.speechSynthesis)`. Never branch on the UA string.
- Web Speech, Web Share, wake lock, and persistent-storage APIs are all partially implemented across these engines — every call site needs a working no-API path, not a broken one.
- Prefer widely-supported syntax over the newest additions. Anything that reached all four engines two or more years ago is safe (`at`, `findLast`, `toSorted`, `structuredClone`, `Object.groupBy`, `Array.fromAsync`). Still uneven, and to be avoided or polyfilled: `Temporal`, `Promise.try`, decorators, and the View Transitions API (missing in Firefox).

## Verification

Before calling a UI change complete, confirm it in **at least two different engines** (e.g. Edge/Chrome plus Firefox), and check the mobile layout at a 375 px-wide viewport with touch emulation on. `npm run dev:lan` serves on `0.0.0.0:3002` for testing against a real phone on the LAN — use it for anything touching gestures, the flip animation, or viewport sizing, since device emulation does not reproduce iOS Safari's compositing or toolbar behaviour. State which browsers you actually checked; if you could not verify one, say so rather than implying you did.
