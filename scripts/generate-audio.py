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
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
PHRASES = ROOT / "scripts" / "phrases.json"
OUT_DIR = ROOT / "public" / "audio" / "ja"
MANIFEST = ROOT / "app" / "data" / "audio-manifest.ts"

# A clear, standard Tokyo-accent voice. Changing this needs --force, since
# existing clips are keyed by what is said and not by who says it, and would
# otherwise be left stale.
VOICE = "ja-JP-NanamiNeural"

# Matches the learner-friendly pace the Web Speech path uses (rate 0.85).
RATE = "-15%"

# Enough to keep the run short without hammering the endpoint.
CONCURRENCY = 6
ATTEMPTS = 3

# Long enough to be collision-free across a deck this size, short enough to keep
# the manifest that ships to the browser small.
STEM_LENGTH = 12

# A run of underscores is a blank for the learner to fill in ("私は＿＿＿です"),
# not something to sound out — read literally, the voice works through the run
# one character at a time. A blank of any length, full-width or ASCII, is held
# open as silence instead, leaving room to say the missing word.
BLANK = re.compile(r"[＿_]+")
BLANK_PAUSE = 2.0

# One frame of digital silence in the format edge-tts returns (MPEG-2 Layer III,
# 24 kHz, 48 kbps, mono): its own 4-byte frame header followed by an empty frame
# body, which decodes to 576 silent samples. Building the pause out of frames the
# voice already produces keeps concatenation valid and this script's only
# dependency `edge-tts` — there is no encoder to install.
SILENT_FRAME = bytes.fromhex("fff364c4") + bytes(140)
FRAME_SECONDS = 576 / 24_000


def silence(seconds: float) -> bytes:
    """A run of silent frames lasting about `seconds`, to the nearest frame."""
    return SILENT_FRAME * round(seconds / FRAME_SECONDS)


def speech_parts(text: str) -> list[str]:
    """The card's text split at its blanks — the pieces the voice actually reads.

    Every joint between two pieces is a blank, and becomes a pause.
    """
    return [part.strip() for part in BLANK.split(text)]


def stem_for(text: str) -> str:
    """Content-addressed name, so editing a card's text yields a fresh clip.

    Keyed on how the card sounds rather than how it is written: changing the
    length of a pause re-renders exactly the clips that have one and leaves the
    rest alone, and two cards that sound identical share a clip. Text with no
    blank keys on itself, unchanged.
    """
    recipe = f"\x00pause:{BLANK_PAUSE}\x00".join(speech_parts(text))
    return hashlib.sha256(recipe.encode("utf-8")).hexdigest()[:STEM_LENGTH]


async def synthesise(text: str) -> bytes:
    """The voice reading one uninterrupted piece of text."""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    audio = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
    if not audio:
        raise RuntimeError("no audio returned")
    return bytes(audio)


async def render(text: str, path: Path) -> None:
    """Writes one clip, retrying — this is a network call and does flake."""
    for attempt in range(1, ATTEMPTS + 1):
        try:
            audio = bytearray()
            for index, part in enumerate(speech_parts(text)):
                # Every piece after the first follows a blank, so the pause goes
                # in front of it — including when the piece is empty, which is a
                # blank at one end of the card.
                if index:
                    audio.extend(silence(BLANK_PAUSE))
                if part:
                    audio.extend(await synthesise(part))
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

    collisions: dict[str, tuple[str, ...]] = {}
    for text in texts:
        stem, parts = stem_for(text), tuple(speech_parts(text))
        # Compared on the pieces, not the text: cards that differ only in how
        # long their blank is sound the same and rightly share a clip.
        if stem in collisions and collisions[stem] != parts:
            print(f"hash collision: {collisions[stem]!r} and {parts!r}", file=sys.stderr)
            return 1
        collisions[stem] = parts

    todo = list({stem_for(t): (t, OUT_DIR / f"{stem_for(t)}.mp3") for t in texts}.values())
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
