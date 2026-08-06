import { useMemo } from "react";
import { biomeFor, type Biome } from "@/game/biomes";

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

/**
 * CSS-only parallax menu backdrop. It reuses the palette of an existing biome
 * map (Forest by default, or a rotating unlocked map) so the home screen
 * matches the in-game art without loading any new images.
 */
function blobs(color: string, size: number, height: number, opacity: number) {
  return {
    backgroundImage: `radial-gradient(${size / 2}px ${height}px at ${size / 2}px 100%, ${color} 99%, transparent 100%)`,
    backgroundSize: `${size}px 100%`,
    backgroundRepeat: "repeat-x",
    backgroundPosition: "bottom",
    opacity,
  } as const;
}

export function MenuBackdrop({ levelIndex = 0 }: { levelIndex?: number }) {
  const b: Biome = useMemo(() => biomeFor(levelIndex), [levelIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${hex(b.skyTop)}, ${hex(b.skyBottom)})` }}
      />
      {/* Moon */}
      <div
        className="absolute right-[12%] top-[10%] size-16 rounded-full blur-[1px] sm:size-20"
        style={{ background: hex(b.moon), opacity: 0.85, boxShadow: `0 0 60px ${hex(b.moon)}55` }}
      />
      {/* Stars */}
      <div
        className="absolute inset-x-[-20%] top-0 h-2/3 animate-drift-slow"
        style={{
          backgroundImage: `radial-gradient(1.5px 1.5px at 20% 30%, ${hex(b.mist)} 99%, transparent), radial-gradient(1.5px 1.5px at 70% 15%, ${hex(b.accent2)} 99%, transparent), radial-gradient(1.5px 1.5px at 45% 60%, ${hex(b.mist)} 99%, transparent)`,
          backgroundSize: "160px 120px",
          opacity: 0.5,
        }}
      />
      {/* Far ridge */}
      <div
        className="absolute inset-x-[-25%] bottom-0 h-[55%] animate-drift-slow"
        style={{ ...blobs(hex(b.far), 320, 150, 0.9), filter: "brightness(1.35)" }}
      />
      {/* Mid canopy */}
      <div
        className="absolute inset-x-[-25%] bottom-0 h-[45%] animate-drift-mid"
        style={{ ...blobs(hex(b.mid), 160, 120, 0.95), filter: "brightness(1.15)" }}
      />
      {/* Near trees */}
      <div
        className="absolute inset-x-[-25%] bottom-0 h-[32%] animate-drift-fast"
        style={blobs(hex(b.near), 80, 90, 1)}
      />
      {/* Glow accents + ground */}
      <div
        className="absolute inset-x-0 bottom-0 h-[14%]"
        style={{ background: `linear-gradient(to top, ${hex(b.terrainTint)}, transparent)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `linear-gradient(to top, ${hex(b.mist)}22, transparent)`,
        }}
      />
      {/* Readability overlay */}
      <div
        className="absolute inset-x-[-25%] bottom-[8%] h-[30%] animate-drift-mid"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 25% 40%, ${hex(b.accent)} 99%, transparent), radial-gradient(2px 2px at 65% 70%, ${hex(b.accent2)} 99%, transparent)`,
          backgroundSize: "160px 100%",
          opacity: 0.55,
        }}
      />
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-overlay/20" />
    </div>
  );
}
