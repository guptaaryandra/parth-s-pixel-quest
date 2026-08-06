import { ArrowLeft, ArrowRight, ArrowUp, Move } from "lucide-react";
import { controls } from "@/game/state";
import type { ControlsLayout, PadKey } from "@/game/settings";

type Props = {
  layout: ControlsLayout;
  /** Edit mode: buttons can be dragged and never fire game input. */
  editing?: boolean;
  onMove?: (key: PadKey, pos: { x: number; y: number }) => void;
};

const ICONS: Record<PadKey, typeof ArrowLeft> = {
  left: ArrowLeft,
  right: ArrowRight,
  jump: ArrowUp,
};

const LABELS: Record<PadKey, string> = {
  left: "Move left",
  right: "Move right",
  jump: "Jump",
};

const KEYS: PadKey[] = ["left", "right", "jump"];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function TouchPad({ layout, editing = false, onMove }: Props) {
  const size = (key: PadKey) => Math.round((key === "jump" ? 80 : 72) * layout.scale);

  const startDrag = (key: PadKey) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!editing || !onMove) return;
    e.preventDefault();
    const host = e.currentTarget.parentElement;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      onMove(key, {
        x: clamp((ev.clientX - rect.left) / rect.width, 0.05, 0.95),
        y: clamp((ev.clientY - rect.top) / rect.height, 0.12, 0.94),
      });
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const inputProps = (key: PadKey) => {
    if (editing) return {};
    const set = (v: boolean) => {
      controls[key] = v;
    };
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        set(true);
      },
      onPointerUp: () => set(false),
      onPointerLeave: () => set(false),
      onPointerCancel: () => set(false),
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    };
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {KEYS.map((key) => {
        const Icon = ICONS[key];
        const px = size(key);
        const pos = layout.positions[key];
        return (
          <button
            key={key}
            type="button"
            aria-label={editing ? `Drag ${LABELS[key]} button` : LABELS[key]}
            onPointerDown={startDrag(key)}
            {...inputProps(key)}
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              width: px,
              height: px,
              opacity: layout.opacity,
              transform: "translate(-50%, -50%)",
            }}
            className={`pointer-events-auto absolute flex touch-none select-none items-center justify-center rounded-2xl border backdrop-blur transition active:scale-95 ${
              key === "jump"
                ? "border-primary/60 bg-primary/25 text-foreground"
                : "border-border bg-panel/85 text-foreground"
            } ${editing ? "cursor-grab ring-2 ring-crystal/70 active:cursor-grabbing" : "active:bg-accent"}`}
          >
            {editing ? (
              <Move style={{ width: px * 0.36, height: px * 0.36 }} className="text-crystal" />
            ) : (
              <Icon style={{ width: px * 0.4, height: px * 0.4 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
