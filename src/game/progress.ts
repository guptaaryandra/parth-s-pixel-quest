/** Level progress persistence (localStorage, offline friendly). */

const KEY = "paq.progress.v1";

export type Progress = {
  /** highest level index the player has unlocked (0-based) */
  unlocked: number;
  /** best score per level index */
  best: Record<number, number>;
};

const empty: Progress = { unlocked: 0, best: {} };

export function loadProgress(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      unlocked: Math.max(0, Number(parsed.unlocked ?? 0)),
      best: parsed.best ?? {},
    };
  } catch {
    return empty;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

/** Marks a level cleared: unlocks the next one and stores the best score. */
export function completeLevel(index: number, score: number): Progress {
  const current = loadProgress();
  const next: Progress = {
    unlocked: Math.max(current.unlocked, index + 1),
    best: { ...current.best, [index]: Math.max(current.best[index] ?? 0, score) },
  };
  saveProgress(next);
  return next;
}

export function resetProgress(): Progress {
  saveProgress(empty);
  return empty;
}
