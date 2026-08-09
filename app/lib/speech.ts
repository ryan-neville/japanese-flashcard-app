"use client";

import { useSyncExternalStore } from "react";
import { audioClips } from "../data/audio-manifest";

/**
 * Japanese pronunciation, from a bundled clip where we have one and the Web
 * Speech API otherwise.
 *
 * Clips come first because Web Speech alone cannot be relied on: Firefox ships
 * no voices of its own and can only speak with one installed in the OS, so a
 * machine without a Japanese speech pack has no Japanese voice at all — and on
 * Windows the packs land in a registry hive Firefox does not even read. Chrome
 * and Edge hide this by bundling their own voices. Every card therefore carries
 * a pre-rendered clip under `/audio/ja/` (see `scripts/generate-audio.py`),
 * which plays the same way in all four engines and needs no OS support.
 *
 * Web Speech remains the fallback for any text with no clip — a card added
 * before the generator is re-run — so the state machine describing it is still
 * here: `checking` until the browser has been probed (also the server's answer,
 * so hydration matches), then `unsupported` where the API is missing,
 * `no-voice` where the API exists but the device has no Japanese voice, and
 * `ready` when a phrase can actually be spoken.
 */
export type SpeechStatus = "checking" | "unsupported" | "no-voice" | "ready";

export interface SpeechState {
  status: SpeechStatus;
  /** Key of the phrase currently being spoken, or null when silent. */
  speakingKey: string | null;
}

/** BCP-47 tags for Japanese: "ja", "ja-JP", and the odd "ja_JP" from Android. */
const JA = /^ja([-_]|$)/i;

/** A learner-friendly pace — full speed clips the ends of short phrases. */
const RATE = 0.85;

/** Where `scripts/generate-audio.py` writes its clips, under `public/`. */
const CLIP_BASE = "/audio/ja/";

/**
 * Whether `text` has a bundled clip, and so can be pronounced regardless of
 * which voices the browser or OS provides. Pure and SSR-safe, so a button can
 * be rendered on the server rather than popping in after the browser is probed.
 */
export function hasClip(text: string): boolean {
  // `Object.hasOwn` rather than a truthiness test: a bare lookup would find
  // inherited members like `toString` and treat them as clip names.
  return Object.hasOwn(audioClips, text);
}

/** The synthesiser, or null during SSR and in browsers without Web Speech. */
function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
    ? window.speechSynthesis
    : null;
}

let status: SpeechStatus = "checking";
let speakingKey: string | null = null;
let voice: SpeechSynthesisVoice | null = null;

// getSnapshot must return a stable object while nothing has changed, or
// useSyncExternalStore re-renders forever — so the snapshot is rebuilt only when
// the state behind it actually moves.
let snapshot: SpeechState = { status, speakingKey };
const SERVER_SNAPSHOT: SpeechState = { status: "checking", speakingKey: null };

const listeners = new Set<() => void>();

function emit(): void {
  snapshot = { status, speakingKey };
  for (const listener of listeners) listener();
}

/**
 * Picks the Japanese voice to speak with. Voices arrive asynchronously in every
 * engine, and Chrome reports an empty list until its own list loads — an empty
 * list therefore means "not known yet", not "none installed", and must not be
 * mistaken for a missing voice.
 */
function refreshVoice(): void {
  const synth = getSynth();
  if (!synth) return;

  let all: SpeechSynthesisVoice[] = [];
  try {
    all = synth.getVoices();
  } catch {
    // Some embedded WebViews throw here; treat it as "no voices yet".
  }

  const japanese = all.filter((v) => JA.test(v.lang));
  voice = japanese.find((v) => v.default) ?? japanese[0] ?? null;

  const next: SpeechStatus = voice !== null || all.length === 0 ? "ready" : "no-voice";
  if (next !== status) {
    status = next;
    emit();
  }
}

let started = false;

/** Probes the browser once, and follows the voice list as it loads. */
function start(): void {
  if (started) return;
  started = true;

  const synth = getSynth();
  if (!synth) {
    status = "unsupported";
    emit();
    return;
  }

  status = "ready";
  refreshVoice();
  emit();

  // Safari has historically populated the list without ever firing the event, so
  // the listener is backed up by a couple of polls rather than trusted alone.
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refreshVoice);
  } else {
    synth.onvoiceschanged = refreshVoice;
  }
  window.setTimeout(refreshVoice, 250);
  window.setTimeout(refreshVoice, 1500);
}

export function subscribe(onChange: () => void): () => void {
  start();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    // Last component using speech is going away (a navigation, usually): don't
    // leave a phrase talking over the next page.
    if (listeners.size === 0) stop();
  };
}

function getSnapshot(): SpeechState {
  return snapshot;
}

function getServerSnapshot(): SpeechState {
  return SERVER_SNAPSHOT;
}

/**
 * Subscribes to which phrase is currently playing, and to whether the Web
 * Speech fallback is usable. Text with a clip plays whatever `status` says.
 */
export function useSpeech(): SpeechState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The clip now playing, held so it can be stopped and its handlers scoped. */
let clip: HTMLAudioElement | null = null;

// Chrome drops utterances that are garbage-collected mid-sentence, taking their
// `end` event with them — holding the live one keeps it alive.
let utterance: SpeechSynthesisUtterance | null = null;

function clearKey(): void {
  if (speakingKey !== null) {
    speakingKey = null;
    emit();
  }
}

export function stop(): void {
  // Cleared first: the clip's own handlers check identity, so dropping the
  // reference is what makes the `pause` below unable to run them.
  const playing = clip;
  clip = null;
  if (playing) playing.pause();

  const synth = getSynth();
  utterance = null;
  // Only cancel when there is something to cancel: some Safari builds drop an
  // utterance queued immediately after an idle `cancel()`.
  if (synth && (speakingKey !== null || synth.speaking || synth.pending)) synth.cancel();
  clearKey();
}

/**
 * Plays the bundled clip for `text`, reporting whether there was one to play.
 *
 * A fresh element per phrase rather than one reused: iOS Safari unlocks an
 * element when it is played inside a gesture, and per-play elements keep each
 * clip's handlers scoped to it, so a stale event cannot clear the state of the
 * phrase that replaced it.
 */
function playClip(text: string, key: string): boolean {
  if (!hasClip(text)) return false;
  if (typeof window === "undefined" || typeof window.Audio !== "function") return false;

  const el = new window.Audio(`${CLIP_BASE}${audioClips[text]}.mp3`);

  const finish = () => {
    if (clip !== el) return;
    clip = null;
    clearKey();
  };

  // The clip could not be fetched or decoded. Dropping the reference first
  // makes this idempotent, since `error` and a rejected `play()` can both fire.
  // Falling back to a voice may be refused on iOS, the gesture having ended by
  // now, but on desktop it still recovers the phrase.
  const fail = () => {
    if (clip !== el) return;
    clip = null;
    clearKey();
    speakWithVoice(text, key);
  };

  el.addEventListener("ended", finish);
  el.addEventListener("error", fail);

  clip = el;
  speakingKey = key;
  emit();

  const started = el.play();
  // Older Safari returns undefined here rather than a promise.
  if (started !== undefined) started.catch(fail);
  return true;
}

/** Speaks `text` through the Web Speech API — the path with no bundled clip. */
function speakWithVoice(text: string, key: string): void {
  const synth = getSynth();
  if (!synth) return;

  const next = new SpeechSynthesisUtterance(text);
  // A voice may still be pending; the language tag alone is enough for the
  // engine to choose a Japanese one once it has loaded them.
  if (voice) next.voice = voice;
  next.lang = voice?.lang ?? "ja-JP";
  next.rate = RATE;

  const finish = () => {
    if (utterance !== next) return;
    utterance = null;
    clearKey();
  };
  next.onend = finish;
  next.onerror = finish;

  utterance = next;
  speakingKey = key;
  emit();

  try {
    synth.speak(next);
  } catch {
    finish();
  }
}

/**
 * Pronounces `text`, tracking it under `key`. Playing the phrase that is
 * already sounding stops it instead.
 *
 * Must be called straight from a user gesture: iOS Safari refuses both audio
 * playback and synthesis that is not, so nothing here may await before starting.
 */
export function speakJapanese(text: string, key: string): void {
  const wasSpeaking = speakingKey;
  stop();
  if (wasSpeaking === key) return;

  if (playClip(text, key)) return;
  speakWithVoice(text, key);
}
