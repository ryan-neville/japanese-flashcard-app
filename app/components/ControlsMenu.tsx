"use client";

import { useEffect, useRef, useState } from "react";
import type { Flashcard } from "../data/flashcards";
import DeckControls, { type Mode } from "./DeckControls";
import HiddenCards from "./HiddenCards";
import SettingsTransfer from "./SettingsTransfer";

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onShuffle: () => void;
  onRestart: () => void;
  onClear: () => void;
  customCount: number;
  englishFirst: boolean;
  onToggleEnglishFirst: () => void;
  hiddenCards: Flashcard[];
  otherHiddenCount: number;
  onUnhide: (card: Flashcard) => void;
  onUnhideAll: () => void;
}

/**
 * Everything about the session that isn't the card itself — deck choice,
 * playback speed, hidden cards, and settings transfer — lives behind one
 * menu, so the card and its immediate controls (prev/flip/next, star, hide)
 * stay the focus of the screen.
 *
 * A tap-triggered panel rather than the native right-click `contextmenu`
 * event: the browser's own context menu is a poor fit for touch (it's
 * reached by a long-press, which is easy to trigger by accident and awkward
 * to discover on purpose) and offers no way to render custom content anyway.
 * A centered modal — rather than a dropdown anchored under the button — also
 * sidesteps viewport-clipping on narrow phone screens while still reading
 * naturally as an in-place menu on desktop.
 */
export default function ControlsMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the panel on open, and back to the trigger on close, so
  // keyboard users land somewhere sensible either way.
  useEffect(() => {
    if (open) panelRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
      >
        <span aria-hidden="true">☰</span> Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Deck and settings menu"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-96 sm:mx-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/20 bg-slate-900 shadow-2xl flex flex-col items-center gap-6 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] focus:outline-none"
          >
            <div className="w-full flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center h-11 w-11 rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
              >
                ✕
              </button>
            </div>

            <DeckControls
              mode={props.mode}
              onModeChange={props.onModeChange}
              onShuffle={props.onShuffle}
              onRestart={props.onRestart}
              onClear={props.onClear}
              customCount={props.customCount}
              englishFirst={props.englishFirst}
              onToggleEnglishFirst={props.onToggleEnglishFirst}
            />

            <HiddenCards
              cards={props.hiddenCards}
              otherCount={props.otherHiddenCount}
              onUnhide={props.onUnhide}
              onUnhideAll={props.onUnhideAll}
            />

            <SettingsTransfer />
          </div>
        </div>
      )}
    </>
  );
}
