import { ArrowLeft, Check, Lock, Play } from "lucide-react";
import { LEVELS } from "@/game/levels";

type Props = {
  unlocked: number;
  best: Record<number, number>;
  onSelect: (index: number) => void;
  onBack: () => void;
};

export function LevelSelect({ unlocked, best, onSelect, onBack }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col gap-3 bg-overlay/90 px-4 py-4 backdrop-blur-sm animate-fade-in sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onPointerUp={onBack} className="inline-flex touch-manipulation select-none items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 font-pixel text-[10px] text-foreground transition hover:bg-accent active:scale-95">
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="font-pixel text-xs text-crystal sm:text-sm">Select Level</h2>
        <span className="font-pixel text-[10px] text-muted-foreground">
          {Math.min(unlocked + 1, LEVELS.length)}/{LEVELS.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {LEVELS.map((lvl, i) => {
            const locked = i > unlocked;
            const cleared = i < unlocked;
            return (
              <button
                key={lvl.id}
                type="button"
                disabled={locked}
                onPointerUp={() => !locked && onSelect(i)}
                title={`${lvl.name} — ${lvl.tagline}`}
                className={
                  "relative flex aspect-square touch-manipulation select-none flex-col items-center justify-center gap-0.5 rounded-xl border text-foreground transition active:scale-95 " +
                  (locked
                    ? "cursor-not-allowed border-border/50 bg-panel/40 text-muted-foreground/60"
                    : cleared
                      ? "border-crystal/60 bg-panel hover:bg-accent"
                      : "border-gold/70 bg-gradient-hero text-primary-foreground shadow-glow")
                }
              >
                <span className="font-pixel text-[10px] tabular-nums">{lvl.id}</span>
                {locked ? (
                  <Lock size={11} />
                ) : cleared ? (
                  <Check size={11} className="text-crystal" />
                ) : (
                  <Play size={11} />
                )}
                {best[i] ? (
                  <span className="text-[8px] tabular-nums opacity-80">{best[i]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Cleared levels stay unlocked on this device — pick up where you left off.
      </p>
    </div>
  );
}
