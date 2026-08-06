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
    <div className="absolute inset-0 z-30 flex flex-col gap-2 bg-overlay/90 px-3 py-2.5 backdrop-blur-sm animate-fade-in sm:px-6 sm:py-3">
      <div className="flex items-center gap-2 pr-40">
        <button
          type="button"
          onPointerUp={onBack}
          className="inline-flex shrink-0 touch-manipulation select-none items-center gap-1.5 rounded-lg border border-border bg-panel px-2.5 py-1.5 font-pixel text-[9px] text-foreground transition hover:bg-accent active:scale-95"
        >
          <ArrowLeft size={12} /> Back
        </button>
        <span className="shrink-0 font-pixel text-[9px] text-muted-foreground tabular-nums">
          {Math.min(unlocked + 1, LEVELS.length)}/{LEVELS.length}
        </span>
        <h2 className="mr-auto truncate font-pixel text-[10px] text-crystal sm:text-xs">
          Select Level
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="grid auto-rows-min justify-center gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(2.75rem,1fr))] sm:gap-2 sm:[grid-template-columns:repeat(auto-fill,minmax(3.25rem,1fr))]">
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
                  "relative mx-auto flex aspect-square w-full max-w-[3.5rem] touch-manipulation select-none flex-col items-center justify-center gap-px rounded-lg border text-foreground transition active:scale-95 " +
                  (locked
                    ? "cursor-not-allowed border-border/50 bg-panel/40 text-muted-foreground/60"
                    : cleared
                      ? "border-crystal/60 bg-panel hover:bg-accent"
                      : "border-gold/70 bg-gradient-hero text-primary-foreground shadow-glow")
                }
              >
                <span className="font-pixel text-[9px] leading-none tabular-nums">{lvl.id}</span>
                {locked ? (
                  <Lock size={9} />
                ) : cleared ? (
                  <Check size={9} className="text-crystal" />
                ) : (
                  <Play size={9} />
                )}
                {best[i] ? (
                  <span className="text-[7px] leading-none tabular-nums opacity-80">{best[i]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <p className="shrink-0 text-center text-[10px] leading-tight text-muted-foreground">
        Cleared levels stay unlocked on this device — pick up where you left off.
      </p>
    </div>
  );
}
