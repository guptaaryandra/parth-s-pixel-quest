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
    <div className="absolute inset-0 z-30 flex flex-col gap-3 bg-overlay/90 px-4 py-3 backdrop-blur-sm animate-fade-in sm:px-8 sm:py-4">
      <div className="flex items-center gap-3 pr-40">
        <button
          type="button"
          onPointerUp={onBack}
          className="inline-flex shrink-0 touch-manipulation select-none items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 font-pixel text-[11px] text-foreground transition hover:bg-accent active:scale-95"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="shrink-0 font-pixel text-[11px] text-muted-foreground tabular-nums">
          {Math.min(unlocked + 1, LEVELS.length)}/{LEVELS.length}
        </span>
        <h2 className="mr-auto truncate font-pixel text-xs text-crystal sm:text-sm">
          Select Level
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="grid auto-rows-min justify-center gap-2 [grid-template-columns:repeat(auto-fill,minmax(4rem,1fr))] sm:gap-3 sm:[grid-template-columns:repeat(auto-fill,minmax(4.5rem,1fr))]">
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
                  "relative mx-auto flex aspect-square w-full max-w-[4.75rem] touch-manipulation select-none flex-col items-center justify-center gap-0.5 rounded-xl border text-foreground transition active:scale-95 " +
                  (locked
                    ? "cursor-not-allowed border-border/50 bg-panel/40 text-muted-foreground/60"
                    : cleared
                      ? "border-crystal/60 bg-panel hover:bg-accent"
                      : "border-gold/70 bg-gradient-hero text-primary-foreground shadow-glow")
                }
              >
                <span className="font-pixel text-[11px] leading-none tabular-nums">{lvl.id}</span>
                {locked ? (
                  <Lock size={12} />
                ) : cleared ? (
                  <Check size={12} className="text-crystal" />
                ) : (
                  <Play size={12} />
                )}
                {best[i] ? (
                  <span className="text-[9px] leading-none tabular-nums opacity-80">{best[i]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <p className="shrink-0 text-center text-[11px] leading-tight text-muted-foreground">
        Cleared levels stay unlocked on this device — pick up where you left off.
      </p>
    </div>
  );
}
