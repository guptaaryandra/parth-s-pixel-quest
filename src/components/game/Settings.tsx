import { useState } from "react";
import { ArrowLeft, Gauge, Move, Music, RotateCcw, Sliders, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { padOpacity, padScale, type ControlsLayout, type PadKey } from "@/game/settings";
import type { AudioMix } from "@/game/audio";
import { TouchPad } from "./TouchPad";

type Props = {
  layout: ControlsLayout;
  onChange: (next: ControlsLayout) => void;
  onReset: () => void;
  onBack: () => void;
  mix: AudioMix;
  onMixChange: (next: Partial<AudioMix>) => void;
};

const TARGETS: { id: "all" | PadKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "jump", label: "Jump" },
];

export function Settings({ layout, onChange, onReset, onBack, mix, onMixChange }: Props) {
  const [tab, setTab] = useState<"controls" | "audio">("controls");
  const [target, setTarget] = useState<"all" | PadKey>("all");

  const scale = target === "all" ? layout.scale : padScale(layout, target);
  const opacity = target === "all" ? layout.opacity : padOpacity(layout, target);

  const setValue = (field: "scale" | "opacity", value: number) => {
    if (target === "all") {
      // A global change clears per-button overrides for that field.
      const overrides = { ...layout.overrides };
      for (const k of ["left", "right", "jump"] as PadKey[]) {
        const { [field]: _drop, ...rest } = overrides[k];
        overrides[k] = rest;
      }
      onChange({ ...layout, [field]: value, overrides });
      return;
    }
    onChange({
      ...layout,
      overrides: {
        ...layout.overrides,
        [target]: { ...layout.overrides[target], [field]: value },
      },
    });
  };

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
          <div className="flex shrink-0 gap-1.5">
            {(["controls", "audio"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onPointerUp={() => setTab(id)}
                className={`touch-manipulation select-none rounded-lg border px-2.5 py-1.5 font-pixel text-[9px] capitalize transition active:scale-95 ${
                  tab === id
                    ? "border-crystal/70 bg-crystal/20 text-crystal"
                    : "border-border bg-panel text-muted-foreground hover:bg-accent"
                }`}
              >
                {id === "controls" ? "Controls" : "Music & SFX"}
              </button>
            ))}
          </div>
        </div>
        {tab === "controls" && (
          <button
            type="button"
            onPointerUp={onReset}
            className="inline-flex shrink-0 touch-manipulation select-none items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 font-pixel text-[10px] text-foreground transition hover:bg-accent active:scale-95"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {tab === "controls" ? (
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
            <div className="flex flex-wrap gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onPointerUp={() => setTarget(t.id)}
                  className={`touch-manipulation select-none rounded-lg border px-2.5 py-1.5 font-pixel text-[9px] transition active:scale-95 ${
                    target === t.id
                      ? "border-crystal/70 bg-crystal/20 text-crystal"
                      : "border-border bg-panel text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 font-pixel text-[9px] text-foreground">
                  <Sliders size={12} className="shrink-0 text-crystal" /> Size
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <Slider
                min={70}
                max={180}
                step={5}
                value={[Math.round(scale * 100)]}
                onValueChange={([v]) => setValue("scale", (v ?? 100) / 100)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 font-pixel text-[9px] text-foreground">
                  <Gauge size={12} className="shrink-0 text-gold" /> Opacity
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <Slider
                min={20}
                max={100}
                step={5}
                value={[Math.round(opacity * 100)]}
                onValueChange={([v]) => setValue("opacity", (v ?? 85) / 100)}
              />
            </div>

            <p className="text-[11px] leading-snug text-muted-foreground">
              Pick <span className="text-crystal">All</span> or a single button, then tune its size
              and opacity. Changes preview instantly and save automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-4">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-panel/80 p-4">
            {(
              [
                { key: "music" as const, label: "Music", Icon: Music, tint: "text-crystal" },
                { key: "sfx" as const, label: "Sound FX", Icon: Volume2, tint: "text-gold" },
              ]
            ).map(({ key, label, Icon, tint }) => {
              const value = Math.round(mix[key] * 100);
              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 font-pixel text-[9px] text-foreground">
                      <Icon size={12} className={`shrink-0 ${tint}`} /> {label}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {value === 0 ? "Off" : `${value}%`}
                      </span>
                      <button
                        type="button"
                        onPointerUp={() => onMixChange({ [key]: value === 0 ? 0.6 : 0 })}
                        className={`touch-manipulation select-none rounded-lg border px-2 py-1 font-pixel text-[9px] transition active:scale-95 ${
                          value === 0
                            ? "border-border bg-panel text-muted-foreground"
                            : "border-crystal/70 bg-crystal/20 text-crystal"
                        }`}
                      >
                        {value === 0 ? "Off" : "On"}
                      </button>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[value]}
                    onValueChange={([v]) => onMixChange({ [key]: (v ?? 0) / 100 })}
                  />
                </div>
              );
            })}

            <p className="text-[11px] leading-snug text-muted-foreground">
              Lower or turn off the <span className="text-crystal">background music</span> and{" "}
              <span className="text-gold">sound effects</span> separately. Settings save
              automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
