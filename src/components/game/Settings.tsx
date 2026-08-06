import { ArrowLeft, Gauge, Move, RotateCcw, Sliders } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { ControlsLayout, PadKey } from "@/game/settings";
import { TouchPad } from "./TouchPad";

type Props = {
  layout: ControlsLayout;
  onChange: (next: ControlsLayout) => void;
  onReset: () => void;
  onBack: () => void;
};

export function Settings({ layout, onChange, onReset, onBack }: Props) {
  const move = (key: PadKey, pos: { x: number; y: number }) =>
    onChange({ ...layout, positions: { ...layout.positions, [key]: pos } });

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-overlay/92 backdrop-blur-sm animate-fade-in">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 pt-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onPointerUp={onBack}
            className="inline-flex shrink-0 touch-manipulation select-none items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 font-pixel text-[10px] text-foreground transition hover:bg-accent active:scale-95"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="truncate font-pixel text-[11px] text-crystal sm:text-xs">Controls</h2>
        </div>
        <button
          type="button"
          onPointerUp={onReset}
          className="inline-flex shrink-0 touch-manipulation select-none items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 font-pixel text-[10px] text-foreground transition hover:bg-accent active:scale-95"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:flex-row">
        {/* Live preview — drag the buttons where you want them */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-gradient-night">
          <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-lg border border-border bg-panel/80 px-3 py-1 text-[11px] text-muted-foreground">
            <Move size={11} className="mr-1 inline text-crystal" />
            Drag any button to reposition
          </span>
          <TouchPad layout={layout} editing onMove={move} />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-border bg-panel/80 p-4 sm:w-64">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-pixel text-[9px] text-foreground">
                <Sliders size={12} className="shrink-0 text-crystal" /> Size
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {Math.round(layout.scale * 100)}%
              </span>
            </div>
            <Slider
              min={70}
              max={180}
              step={5}
              value={[Math.round(layout.scale * 100)]}
              onValueChange={([v]) => onChange({ ...layout, scale: (v ?? 100) / 100 })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-pixel text-[9px] text-foreground">
                <Gauge size={12} className="shrink-0 text-gold" /> Opacity
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {Math.round(layout.opacity * 100)}%
              </span>
            </div>
            <Slider
              min={20}
              max={100}
              step={5}
              value={[Math.round(layout.opacity * 100)]}
              onValueChange={([v]) => onChange({ ...layout, opacity: (v ?? 85) / 100 })}
            />
          </div>

          <p className="text-[11px] leading-snug text-muted-foreground">
            Changes preview instantly and save automatically to this device.
          </p>
        </div>
      </div>
    </div>
  );
}
