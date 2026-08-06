/** Persisted on-screen control layout (size, opacity, positions). */

const KEY = "paq.controls.v1";

export type PadKey = "left" | "right" | "jump";

/** Position as a fraction of the play area (0-1), pointing at the button centre. */
export type PadPos = { x: number; y: number };

export type ControlsLayout = {
  /** button scale multiplier */
  scale: number;
  /** button opacity 0.2 - 1 */
  opacity: number;
  positions: Record<PadKey, PadPos>;
};

export const DEFAULT_LAYOUT: ControlsLayout = {
  scale: 1,
  opacity: 0.85,
  positions: {
    left: { x: 0.09, y: 0.84 },
    right: { x: 0.22, y: 0.84 },
    jump: { x: 0.9, y: 0.83 },
  },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function sanitize(raw: Partial<ControlsLayout> | null): ControlsLayout {
  if (!raw) return DEFAULT_LAYOUT;
  const pos = raw.positions ?? DEFAULT_LAYOUT.positions;
  const read = (k: PadKey): PadPos => {
    const p = pos[k] ?? DEFAULT_LAYOUT.positions[k];
    return {
      x: clamp(Number(p.x ?? DEFAULT_LAYOUT.positions[k].x), 0.05, 0.95),
      y: clamp(Number(p.y ?? DEFAULT_LAYOUT.positions[k].y), 0.12, 0.94),
    };
  };
  return {
    scale: clamp(Number(raw.scale ?? 1), 0.7, 1.8),
    opacity: clamp(Number(raw.opacity ?? 0.85), 0.2, 1),
    positions: { left: read("left"), right: read("right"), jump: read("jump") },
  };
}

export function loadLayout(): ControlsLayout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(KEY);
    return sanitize(raw ? (JSON.parse(raw) as Partial<ControlsLayout>) : null);
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function saveLayout(layout: ControlsLayout): ControlsLayout {
  const clean = sanitize(layout);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(clean));
    } catch {
      /* storage unavailable */
    }
  }
  return clean;
}

export function resetLayout(): ControlsLayout {
  return saveLayout(DEFAULT_LAYOUT);
}
