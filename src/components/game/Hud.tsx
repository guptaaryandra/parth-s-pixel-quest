import { Coins, Gem, Heart, Shield } from "lucide-react";

type Props = {
  score: number;
  lives: number;
  maxLives: number;
  crystals: number;
  totalCrystals: number;
  level: number;
  totalLevels: number;
  levelName: string;
  wallet: number;
  shielded: boolean;
};

export function Hud({
  score,
  lives,
  maxLives,
  crystals,
  totalCrystals,
  level,
  totalLevels,
  levelName,
  wallet,
  shielded,
}: Props) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[70%] flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-panel/80 px-3 py-1.5 backdrop-blur">
        <Coins size={16} className="text-gold" />
        <span className="font-pixel text-xs text-foreground tabular-nums">{score}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-panel/80 px-3 py-1.5 backdrop-blur">
        <Gem size={16} className="text-crystal" />
        <span className="font-pixel text-xs text-foreground tabular-nums">
          {crystals}/{totalCrystals}
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-border bg-panel/80 px-3 py-1.5 backdrop-blur">
        {Array.from({ length: Math.max(maxLives, lives) }).map((_, i) => (
          <Heart
            key={i}
            size={16}
            className={i < lives ? "fill-danger text-danger" : "text-muted-foreground/40"}
          />
        ))}
      </div>
      {shielded && (
        <div className="flex items-center gap-1.5 rounded-xl border border-crystal/60 bg-panel/80 px-3 py-1.5 backdrop-blur">
          <Shield size={16} className="text-crystal" />
        </div>
      )}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-panel/80 px-3 py-1.5 backdrop-blur">
        <Coins size={14} className="text-gold" />
        <span className="font-pixel text-[10px] text-gold tabular-nums">{wallet}</span>
      </div>
      <div className="rounded-xl border border-border bg-panel/80 px-3 py-1.5 backdrop-blur">
        <span className="font-pixel text-[10px] text-crystal tabular-nums">
          Lv {level}/{totalLevels}
        </span>
        <span className="ml-2 hidden text-[11px] text-muted-foreground sm:inline">{levelName}</span>
      </div>
    </div>
  );
}
