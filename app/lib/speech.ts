"use client";

import { useSyncExternalStore } from "react";

/**
 * Japanese text-to-speech over the Web Speech API.
 *
 * Support is uneven across the engines this app targets, so the state machine is
 * explicit: `checking` until the browser has been probed (also the server's
 * answer, so hydration matches), then `unsupported` where the API is missing,
 * `no-voice` where the API exists but the device has no Japanese voice
 * installed, and `ready` when a phrase can actually be spoken. Callers render a
 * button only for the last two states, and disable it for `no-voice`.
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

/** Subscribes to speech availability and to which phrase is currently playing. */
export function useSpeech(): SpeechState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Chrome drops utterances that are garbage-collected mid-sentence, taking their
// `end` event with them — holding the live one keeps it alive.
let utterance: SpeechSynthesisUtterance | null = null;

export function stop(): void {
  const synth = getSynth();
  utterance = null;
  // Only cancel when there is something to cancel: some Safari builds drop an
  // utterance queued immediately after an idle `cancel()`.
  if (synth && (speakingKey !== null || synth.speaking || synth.pending)) synth.cancel();
  if (speakingKey !== null) {
    speakingKey = null;
    emit();
  }
}

/**
 * Speaks `text` in Japanese, tracking it under `key`. Speaking the phrase that
 * is already playing stops it instead.
 *
 * Must be called straight from a user gesture: iOS Safari refuses synthesis that
 * is not, so nothing here may await before `speak`.
 */
export function speakJapanese(text: string, key: string): void {
  const synth = getSynth();
  if (!synth) return;

  const wasSpeaking = speakingKey;
  stop();
  if (wasSpeaking === key) return;

  const next = new SpeechSynthesisUtterance(text);
  // A voice may still be pending; the language tag alone is enough for the
  // engine to choose a Japanese one once it has loaded them.
  if (voice) next.voice = voice;
  next.lang = voice?.lang ?? "ja-JP";
  next.rate = RATE;

  const finish = () => {
    if (utterance !== next) return;
    utterance = null;
    if (speakingKey !== null) {
      speakingKey = null;
      emit();
    }
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
