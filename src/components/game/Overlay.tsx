import {
  ArrowRight,
  Coins,
  Gem,
  Home,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { GameStatus } from "@/game/state";

type Props = {
  status: GameStatus;
  score: number;
  level: number;
  totalLevels: number;
  levelName: string;
  levelTagline: string;
  nextLevelName: string;
  wallet: number;
  onPlay: () => void;
  onShop: () => void;
  onResume: () => void;
  onNextLevel: () => void;
  onRetryLevel: () => void;
  onGoHome: () => void;
};


const panel =
  "absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-overlay/85 px-6 text-center backdrop-blur-sm animate-fade-in";

/** Home screen keeps the biome backdrop visible behind a soft vignette. */
const homePanel =
  "absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-linear-to-t from-overlay/80 via-overlay/30 to-overlay/20 px-6 text-center animate-fade-in";

const cta =
  "inline-flex touch-manipulation select-none items-center gap-2 rounded-2xl bg-gradient-hero px-7 py-3 font-pixel text-xs text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-95";

const ghost =
  "inline-flex touch-manipulation select-none items-center gap-2 rounded-2xl border border-border bg-panel px-6 py-3 font-pixel text-xs text-foreground transition hover:bg-accent active:scale-95";

export function Overlay({
  status,
  score,
  level,
  totalLevels,
  levelName,
  levelTagline,
  nextLevelName,
  wallet,
  onPlay,
  onShop,
  onResume,
  onNextLevel,
  onRetryLevel,
  onGoHome,
}: Props) {
  if (status === "playing" || status === "levelselect" || status === "shop" || status === "settings")
    return null;


  if (status === "start") {
    return (
      <div className={homePanel}>
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em] text-crystal">
          A pixel adventure
        </span>
        <h1 className="font-pixel text-2xl leading-relaxed text-foreground sm:text-4xl">
          Parth&apos;s
          <br />
          <span className="text-gold">Anime Quest</span>
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {totalLevels} worlds of twilight. Gather every glowing crystal, scoop up the coins, and
          slip past the cute shadow monsters.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onPointerUp={onPlay} className={cta}>
            <Play size={16} /> Play
          </button>
          <button type="button" onPointerUp={onShop} className={ghost}>
            <ShoppingBag size={16} /> Shop
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Trophy size={14} className="text-crystal" /> {totalLevels} levels
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-gold" /> 3 lives
          </span>
          <span className="flex items-center gap-1.5">
            <Coins size={14} className="text-gold" /> {wallet} banked
          </span>
        </div>
      </div>
    );
  }


  if (status === "paused") {
    return (
      <div className={panel}>
        <span className="font-pixel text-[10px] uppercase tracking-[0.3em] text-crystal">
          Level {level} · {levelName}
        </span>
        <h2 className="font-pixel text-xl text-foreground">Paused</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onPointerUp={onResume} className={cta}>
            <Play size={16} /> Resume
          </button>
          <button type="button" onPointerUp={onPlay} className={ghost}>
            <RotateCcw size={16} /> New game
          </button>
        </div>
      </div>
    );
  }

  if (status === "levelclear") {
    return (
      <div className={panel}>
        <span className="font-pixel text-[10px] uppercase tracking-[0.3em] text-gold">
          Level {level} of {totalLevels} cleared
        </span>
        <h2 className="font-pixel text-2xl text-crystal sm:text-3xl">Crystals Restored!</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Next up: <span className="text-foreground">{nextLevelName}</span> — {levelTagline}
        </p>
        <div className="rounded-2xl border border-border bg-panel px-6 py-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Score</span>
          <div className="font-pixel text-xl text-gold tabular-nums">{score}</div>
        </div>
        <button type="button" onPointerUp={onNextLevel} className={cta}>
          Next level <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const win = status === "victory";
  return (
    <div className={panel}>
      <h2 className={`font-pixel text-2xl sm:text-3xl ${win ? "text-crystal" : "text-danger"}`}>
        {win ? "Victory!" : "Game Over"}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {win
          ? `Parth cleared all ${totalLevels} worlds and the valley glows again.`
          : `The shadows caught Parth on level ${level}. The valley still needs its light.`}
      </p>
      <div className="rounded-2xl border border-border bg-panel px-6 py-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Final score</span>
        <div className="font-pixel text-xl text-gold tabular-nums">{score}</div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Gem size={14} className="text-crystal" /> Reached {levelName}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!win && (
          <button type="button" onPointerUp={onRetryLevel} className={cta}>
            <RotateCcw size={16} /> Retry level {level}
          </button>
        )}
        {win ? (
          <button type="button" onPointerUp={onPlay} className={cta}>
            <Play size={16} /> Play again
          </button>
        ) : (
          <button type="button" onPointerUp={onGoHome} className={ghost}>
            <Home size={16} /> Home
          </button>
        )}
      </div>


    </div>
  );
}
