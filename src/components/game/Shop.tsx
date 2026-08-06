import { ArrowLeft, Check, Coins, Shirt, Sparkles } from "lucide-react";
import { OUTFITS, POWERS, type ShopState } from "@/game/shop";

type Props = {
  state: ShopState;
  onBuy: (id: string, price: number) => void;
  onEquip: (id: string) => void;
  onBack: () => void;
};

const card =
  "flex flex-col gap-1 rounded-lg border border-border bg-panel/80 p-2 text-left backdrop-blur";

const buy =
  "mt-auto inline-flex touch-manipulation select-none items-center justify-center gap-1 rounded-md bg-gradient-hero px-2 py-1 font-pixel text-[8px] text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-40";

const own =
  "mt-auto inline-flex touch-manipulation select-none items-center justify-center gap-1 rounded-md border border-crystal/60 px-2 py-1 font-pixel text-[8px] text-crystal transition hover:bg-accent active:scale-95";

const grid =
  "grid auto-rows-min items-start gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr))] sm:gap-2 sm:[grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr))]";

export function Shop({ state, onBuy, onEquip, onBack }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col gap-2 bg-overlay/90 px-3 py-2.5 backdrop-blur-sm animate-fade-in sm:px-6 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onPointerUp={onBack}
          className="inline-flex shrink-0 touch-manipulation select-none items-center gap-1.5 rounded-lg border border-border bg-panel px-2.5 py-1.5 font-pixel text-[9px] text-foreground transition hover:bg-accent active:scale-95"
        >
          <ArrowLeft size={12} /> Back
        </button>
        <h2 className="truncate font-pixel text-[10px] text-crystal sm:text-xs">Crystal Bazaar</h2>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-panel px-2.5 py-1.5">
          <Coins size={12} className="text-gold" />
          <span className="font-pixel text-[9px] text-gold tabular-nums">{state.coins}</span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <h3 className="mb-1.5 flex items-center gap-1.5 font-pixel text-[9px] text-gold">
          <Shirt size={11} /> Outfits
        </h3>
        <div className={grid}>
          {OUTFITS.map((o) => {
            const owned = state.owned.includes(o.id);
            const equipped = state.outfit === o.id;
            const swatch = [
              o.colors["c"] ?? "#2fb6a8",
              o.colors["r"] ?? "#ef5f78",
              o.colors["p"] ?? "#33406b",
            ];
            return (
              <div key={o.id} className={card}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="flex shrink-0 overflow-hidden rounded border border-border">
                    {swatch.map((c) => (
                      <span key={c} className="size-3" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="truncate font-pixel text-[8px] text-foreground">{o.name}</span>
                </div>
                <p className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                  {o.desc}
                </p>
                {owned ? (
                  equipped ? (
                    <span className="mt-auto inline-flex items-center gap-1 font-pixel text-[8px] text-crystal">
                      <Check size={10} /> Equipped
                    </span>
                  ) : (
                    <button type="button" onPointerUp={() => onEquip(o.id)} className={own}>
                      Wear
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={state.coins < o.price}
                    onPointerUp={() => state.coins >= o.price && onBuy(o.id, o.price)}
                    className={buy}
                  >
                    <Coins size={9} /> {o.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <h3 className="mb-1.5 mt-3 flex items-center gap-1.5 font-pixel text-[9px] text-crystal">
          <Sparkles size={11} /> Power-ups
        </h3>
        <div className={grid}>
          {POWERS.map((p) => {
            const owned = state.owned.includes(p.id);
            return (
              <div key={p.id} className={card}>
                <span className="truncate font-pixel text-[8px] text-foreground">{p.name}</span>
                <p className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                  {p.desc}
                </p>
                {owned ? (
                  <span className="mt-auto inline-flex items-center gap-1 font-pixel text-[8px] text-crystal">
                    <Check size={10} /> Active
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={state.coins < p.price}
                    onPointerUp={() => state.coins >= p.price && onBuy(p.id, p.price)}
                    className={buy}
                  >
                    <Coins size={9} /> {p.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="shrink-0 text-center text-[10px] leading-tight text-muted-foreground">
        Every coin you grab in a level is banked here — spend it on outfits and power-ups.
      </p>
    </div>
  );
}
