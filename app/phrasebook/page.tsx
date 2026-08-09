import type { Metadata } from "next";
import Link from "next/link";
import PhraseList from "../components/PhraseList";

export const metadata: Metadata = {
  title: "Phrasebook — 日本語 Flashcards",
  description: "Japan travel phrasebook, browsable by section",
};

export default function PhrasebookPage() {
  return (
    <main className="flex-1 flex flex-col items-center gap-8 px-4 py-12 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Phrasebook</h1>
        <p className="text-white/50 text-sm">Japan Travel Phrasebook</p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors border border-white/10 touch-manipulation"
      >
        ← Flashcards
      </Link>

      <PhraseList />
    </main>
  );
}
