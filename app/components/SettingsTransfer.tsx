"use client";

import { useRef, useState } from "react";
import { exportProgress, importProgress } from "../lib/progress";

const FILENAME = "japanese-flashcards-settings.json";

/** Moves saved settings (deck, hidden cards, "My List", English-first,
 * playback speed) between browsers as a downloadable JSON file. Self-contained
 * like `PlaybackSpeedControl`: it reads and writes the `progress` store
 * directly rather than being prop-drilled from the page. */
export default function SettingsTransfer() {
  const [status, setStatus] = useState<"idle" | "imported" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    setStatus(importProgress(text) ? "imported" : "error");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleExport}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Export settings
        </button>
        <button
          onClick={handleImportClick}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Import settings
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {status === "imported" && (
        <p className="text-emerald-300/80 text-xs">Settings imported.</p>
      )}
      {status === "error" && (
        <p className="text-rose-300/80 text-xs">That file isn&apos;t a valid settings export.</p>
      )}
    </div>
  );
}
