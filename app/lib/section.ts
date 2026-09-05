const STORAGE_KEY = "japanese-flashcards:phrasebook-section";

export function saveSection(section: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, section);
  } catch {
    // Storage full or blocked: the section just won't survive the refresh.
  }
}

/** Last section the user browsed, used to fill in a bare `/phrasebook` URL. */
export function getSection(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The server has no storage to read, so a bare URL resolves to "all" until hydration. */
export function getServerSection(): string | null {
  return null;
}

/** Nothing outside this module's own `saveSection` calls ever changes the
 * value, and those calls happen in the same component that reads it, so no
 * live-update notification is needed — this only exists to satisfy
 * `useSyncExternalStore`'s contract. */
export function subscribeSection(): () => void {
  return () => {};
}
