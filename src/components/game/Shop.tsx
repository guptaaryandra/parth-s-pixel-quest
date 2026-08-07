import { ArrowLeft, Check, Coins, Shirt, Sparkles } from "lucide-react";
import { OUTFITS, POWERS, type ShopState } from "@/game/shop";

type Props = {
  state: ShopState;
  onBuy: (id: string, price: number) => void;
  onEquip: (id: string) => void;
  onBack: () => void;
};

const card =
  "flex flex-col gap-2 rounded-xl border border-border bg-panel/80 p-3 text-left backdrop-blur";

const buy =
  "mt-auto inline-flex touch-manipulation select-none items-center justify-center gap-1.5 rounded-md bg-gradient-hero px-3 py-1.5 font-pixel text-[10px] text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-40";

const own =
  "mt-auto inline-flex touch-manipulation select-none items-center justify-center gap-1.5 rounded-md border border-crystal/60 px-3 py-1.5 font-pixel text-[10px] text-crystal transition hover:bg-accent active:scale-95";

const grid =
  "grid auto-rows-min items-start gap-2 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))] sm:gap-3 sm:[grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))]";

export function Shop({ state, onBuy, onEquip, onBack }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col gap-3 bg-overlay/90 px-4 py-3 backdrop-blur-sm animate-fade-in sm:px-8 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onPointerUp={onBack}
          className="inline-flex shrink-0 touch-manipulation select-none items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 font-pixel text-[11px] text-foreground transition hover:bg-accent active:scale-95"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="truncate font-pixel text-xs text-crystal sm:text-sm">Crystal Bazaar</h2>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-2">
          <Coins size={14} className="text-gold" />
          <span className="font-pixel text-[11px] text-gold tabular-nums">{state.coins}</span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <h3 className="mb-2 flex items-center gap-2 font-pixel text-[11px] text-gold">
          <Shirt size={13} /> Outfits
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
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex shrink-0 overflow-hidden rounded border border-border">
                    {swatch.map((c) => (
                      <span key={c} className="size-4" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="truncate font-pixel text-[10px] text-foreground sm:text-xs">{o.name}</span>
                </div>
                <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {o.desc}
                </p>
                {owned ? (
                  equipped ? (
                    <span className="mt-auto inline-flex items-center gap-1.5 font-pixel text-[10px] text-crystal">
                      <Check size={12} /> Equipped
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
                    <Coins size={11} /> {o.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <h3 className="mb-2 mt-4 flex items-center gap-2 font-pixel text-[11px] text-crystal">
          <Sparkles size={13} /> Power-ups
        </h3>
        <div className={grid}>
          {POWERS.map((p) => {
            const owned = state.owned.includes(p.id);
            return (
              <div key={p.id} className={card}>
                <span className="truncate font-pixel text-[10px] text-foreground sm:text-xs">{p.name}</span>
                <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {p.desc}
                </p>
                {owned ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 font-pixel text-[10px] text-crystal">
                    <Check size={12} /> Active
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={state.coins < p.price}
                    onPointerUp={() => state.coins >= p.price && onBuy(p.id, p.price)}
                    className={buy}
                  >
                    <Coins size={11} /> {p.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="shrink-0 text-center text-[11px] leading-tight text-muted-foreground">
        Every coin you grab in a level is banked here — spend it on outfits and power-ups.
      </p>
    </div>
  );
}
