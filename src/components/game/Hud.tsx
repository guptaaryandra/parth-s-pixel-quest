import { Coins, Gem, Heart } from "lucide-react";

type Props = { score: number; lives: number; crystals: number; totalCrystals: number };

export function Hud({ score, lives, crystals, totalCrystals }: Props) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
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
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            size={16}
            className={i < lives ? "fill-danger text-danger" : "text-muted-foreground/40"}
          />
        ))}
      </div>
    </div>
  );
}
