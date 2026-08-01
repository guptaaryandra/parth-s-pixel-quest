import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { controls } from "@/game/state";

function padProps(key: "left" | "right" | "jump") {
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
}

const base =
  "flex size-16 touch-none select-none items-center justify-center rounded-2xl border border-border bg-panel/85 text-foreground backdrop-blur transition active:scale-95 active:bg-accent";

export function TouchPad() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4">
      <div className="pointer-events-auto flex gap-3">
        <button aria-label="Move left" className={base} {...padProps("left")}>
          <ArrowLeft />
        </button>
        <button aria-label="Move right" className={base} {...padProps("right")}>
          <ArrowRight />
        </button>
      </div>
      <button
        aria-label="Jump"
        className={`${base} pointer-events-auto size-20 border-primary/60 bg-primary/25`}
        {...padProps("jump")}
      >
        <ArrowUp className="size-7" />
      </button>
    </div>
  );
}
