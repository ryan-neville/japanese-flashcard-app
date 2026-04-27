"use client";

type Mode = "hiragana" | "katakana" | "both";

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onShuffle: () => void;
  onRestart: () => void;
}

const modes: { value: Mode; label: string }[] = [
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" },
  { value: "both", label: "Both" },
];

export default function DeckControls({ mode, onModeChange, onShuffle, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mode selector */}
      <div className="flex rounded-xl overflow-hidden border border-white/20">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`px-5 py-2.5 min-h-[44px] text-sm font-medium transition-colors touch-manipulation ${
              mode === m.value
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onShuffle}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Shuffle
        </button>
        <button
          onClick={onRestart}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
