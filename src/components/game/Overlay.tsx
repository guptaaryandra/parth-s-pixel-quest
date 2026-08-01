import { Gem, Play, RotateCcw, Sparkles } from "lucide-react";
import type { GameStatus } from "@/game/state";

type Props = {
  status: GameStatus;
  score: number;
  onPlay: () => void;
  onResume: () => void;
};

const panel =
  "absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-overlay/85 px-6 text-center backdrop-blur-sm animate-fade-in";

const cta =
  "inline-flex touch-manipulation select-none items-center gap-2 rounded-2xl bg-gradient-hero px-7 py-3 font-pixel text-xs text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-95";


export function Overlay({ status, score, onPlay, onResume }: Props) {
  if (status === "playing") return null;

  if (status === "start") {
    return (
      <div className={panel}>
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em] text-crystal">
          A pixel adventure
        </span>
        <h1 className="font-pixel text-2xl leading-relaxed text-foreground sm:text-4xl">
          Parth&apos;s
          <br />
          <span className="text-gold">Anime Quest</span>
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Gather every glowing crystal, scoop up the coins, and slip past the cute shadow monsters
          of the twilight valley.
        </p>
        <button type="button" onPointerUp={onPlay} className={cta}>
          <Play size={16} /> Play
        </button>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Gem size={14} className="text-crystal" /> 5 crystals
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-gold" /> 3 lives
          </span>
        </div>
      </div>
    );
  }

  if (status === "paused") {
    return (
      <div className={panel}>
        <h2 className="font-pixel text-xl text-foreground">Paused</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onPointerUp={onResume} className={cta}>
            <Play size={16} /> Resume
          </button>
          <button
            type="button"
            onPointerUp={onPlay}
            className="inline-flex touch-manipulation select-none items-center gap-2 rounded-2xl border border-border bg-panel px-6 py-3 font-pixel text-xs text-foreground transition hover:bg-accent active:scale-95"
          >
            <RotateCcw size={16} /> Restart
          </button>
        </div>
      </div>
    );
  }

  const win = status === "victory";
  return (
    <div className={panel}>
      <h2
        className={`font-pixel text-2xl sm:text-3xl ${win ? "text-crystal" : "text-danger"}`}
      >
        {win ? "Victory!" : "Game Over"}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {win
          ? "Parth gathered every crystal and the valley glows again."
          : "The shadows caught Parth. The valley still needs its light."}
      </p>
      <div className="rounded-2xl border border-border bg-panel px-6 py-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Score</span>
        <div className="font-pixel text-xl text-gold tabular-nums">{score}</div>
      </div>
      <button type="button" onPointerUp={onPlay} className={cta}>
        <RotateCcw size={16} /> Play again
      </button>
    </div>
  );
}
