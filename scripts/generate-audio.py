"""Pre-renders a Japanese audio clip for every card in the decks.

Firefox ships no voices of its own — it can only speak with a voice installed in
the OS, and a Windows or Linux box without a Japanese speech pack has none. So
pronunciation cannot rely on the Web Speech API alone. These clips are generated
once, committed, and served from the app itself, which works in every engine and
needs no network at use time.

Usage (from the project root):

    node scripts/extract-phrases.mjs > scripts/phrases.json
    pip install edge-tts
    python scripts/generate-audio.py

Existing clips are left alone, so re-running after adding cards only fetches the
new ones. Pass --force to re-render everything (e.g. after changing VOICE).
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
PHRASES = ROOT / "scripts" / "phrases.json"
OUT_DIR = ROOT / "public" / "audio" / "ja"
MANIFEST = ROOT / "app" / "data" / "audio-manifest.ts"

# A clear, standard Tokyo-accent voice. Changing this needs --force, since
# existing clips are keyed by text alone and would otherwise be left stale.
VOICE = "ja-JP-NanamiNeural"

# Matches the learner-friendly pace the Web Speech path uses (rate 0.85).
RATE = "-15%"

# Enough to keep the run short without hammering the endpoint.
CONCURRENCY = 6
ATTEMPTS = 3

# Long enough to be collision-free across a deck this size, short enough to keep
# the manifest that ships to the browser small.
STEM_LENGTH = 12


def stem_for(text: str) -> str:
    """Content-addressed name, so editing a card's text yields a fresh clip."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:STEM_LENGTH]


async def render(text: str, path: Path) -> None:
    """Writes one clip, retrying — this is a network call and does flake."""
    for attempt in range(1, ATTEMPTS + 1):
        try:
            communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
            audio = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio.extend(chunk["data"])
            if not audio:
                raise RuntimeError("no audio returned")
            # Write via a temp file so an interrupted run cannot leave a
            # truncated clip that a later run would treat as already done.
            tmp = path.with_suffix(".partial")
            tmp.write_bytes(bytes(audio))
            tmp.replace(path)
            return
        except Exception as err:  # noqa: BLE001 - reported and retried below
            if attempt == ATTEMPTS:
                raise
            print(f"  retry {attempt}/{ATTEMPTS - 1} for {text!r}: {err}", file=sys.stderr)
            await asyncio.sleep(1.5 * attempt)


def write_manifest(texts: list[str]) -> None:
    """Emits the text -> clip lookup the client uses to pick a file."""
    entries = "\n".join(f"  {json.dumps(t, ensure_ascii=False)}: {json.dumps(stem_for(t))}," for t in texts)
    MANIFEST.write_text(
        "// GENERATED FILE - do not edit by hand.\n"
        "// Run `node scripts/extract-phrases.mjs > scripts/phrases.json` then\n"
        "// `python scripts/generate-audio.py` to regenerate.\n"
        "\n"
        "/**\n"
        " * Maps a card's Japanese text to the stem of its pre-rendered clip under\n"
        " * `/audio/ja/`. Bundled audio is what makes pronunciation work in Firefox,\n"
        " * which has no Japanese voice of its own to fall back on.\n"
        " */\n"
        "export const audioClips: Readonly<Record<string, string>> = {\n"
        f"{entries}\n"
        "};\n",
        encoding="utf-8",
    )


async def main() -> int:
    force = "--force" in sys.argv

    if not PHRASES.exists():
        print(f"missing {PHRASES.relative_to(ROOT)} - run scripts/extract-phrases.mjs first", file=sys.stderr)
        return 1

    texts: list[str] = json.loads(PHRASES.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    collisions: dict[str, str] = {}
    for text in texts:
        stem = stem_for(text)
        if stem in collisions and collisions[stem] != text:
            print(f"hash collision: {collisions[stem]!r} and {text!r}", file=sys.stderr)
            return 1
        collisions[stem] = text

    todo = [(t, OUT_DIR / f"{stem_for(t)}.mp3") for t in texts]
    if not force:
        todo = [(t, p) for t, p in todo if not p.exists() or p.stat().st_size == 0]

    print(f"{len(texts)} phrases, {len(todo)} to render with {VOICE}")

    failures: list[str] = []
    semaphore = asyncio.Semaphore(CONCURRENCY)
    done = 0

    async def worker(text: str, path: Path) -> None:
        nonlocal done
        async with semaphore:
            try:
                await render(text, path)
            except Exception as err:  # noqa: BLE001 - collected, reported at the end
                failures.append(text)
                print(f"FAILED {text!r}: {err}", file=sys.stderr)
            done += 1
            if done % 25 == 0 or done == len(todo):
                print(f"  {done}/{len(todo)}")

    await asyncio.gather(*(worker(t, p) for t, p in todo))

    # Only phrases that actually have a clip belong in the manifest; a missing
    # entry makes the app fall back to Web Speech rather than 404 on play.
    have = [t for t in texts if (OUT_DIR / f"{stem_for(t)}.mp3").exists()]
    write_manifest(have)

    wanted = {f"{stem_for(t)}.mp3" for t in texts}
    orphans = [p.name for p in OUT_DIR.glob("*.mp3") if p.name not in wanted]
    if orphans:
        print(f"{len(orphans)} clip(s) no longer referenced by any card:")
        for name in orphans:
            print(f"  {name}")

    total = sum(p.stat().st_size for p in OUT_DIR.glob("*.mp3"))
    print(f"{len(have)}/{len(texts)} clips present, {total / 1_048_576:.1f} MiB total")
    print(f"manifest -> {MANIFEST.relative_to(ROOT)}")

    if failures:
        print(f"{len(failures)} phrase(s) failed; re-run to retry them", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
