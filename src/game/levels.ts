/** Level definitions + deterministic layout generator (no assets needed). */

export type Seg = [startTile: number, endTile: number];
export type Platform = [tileX: number, y: number, tiles: number];
export type Point = [tileX: number, y: number];
export type Monster = [tileX: number, y: number, range: number];

export type Palette = {
  skyTop: number;
  skyBottom: number;
  hillFar: number;
  hillNear: number;
  moon: number;
};

export type LevelConfig = {
  id: number;
  name: string;
  tagline: string;
  tiles: number;
  gaps: number;
  platforms: number;
  monsters: number;
  monsterRange: [min: number, max: number];
  crystals: number;
  seed: number;
  palette: Palette;
};

type LevelSeed = [name: string, tagline: string, palette: Palette];

const P = (
  skyTop: number,
  skyBottom: number,
  hillFar: number,
  hillNear: number,
  moon: number,
): Palette => ({ skyTop, skyBottom, hillFar, hillNear, moon });

/** 50 hand-named worlds; difficulty is derived from the index. */
const SEEDS: LevelSeed[] = [
  ["Twilight Valley", "Gentle hills and curious shadows.", P(0x151129, 0x3a2a55, 0x241c3d, 0x2e2450, 0xfdf1c7)],
  ["Lantern Woods", "Higher ledges, wider leaps.", P(0x0f1a24, 0x21463c, 0x16302c, 0x1e463b, 0xd8f5c7)],
  ["Sakura Ridge", "Petals drift over hungry gaps.", P(0x2a1024, 0x64304c, 0x421e36, 0x5a2b46, 0xffd9e8)],
  ["Storm Bastion", "Fast shadows patrol the towers.", P(0x101426, 0x243a63, 0x1a2445, 0x243259, 0xcfe4ff)],
  ["Ember Summit", "The first real climb.", P(0x240f14, 0x6b2a1e, 0x3d1618, 0x552019, 0xffd08a)],
  ["Frost Hollow", "Ice-blue caverns and slick ledges.", P(0x0b1a26, 0x1f4a63, 0x14313f, 0x1c4657, 0xdff4ff)],
  ["Neon Bazaar", "Bright signs, sharper shadows.", P(0x1b0b2a, 0x5a1c6b, 0x321044, 0x461659, 0xffc9f5)],
  ["Thunder Spires", "Long leaps between the towers.", P(0x0d1020, 0x2b3f7a, 0x161d3c, 0x1f2a55, 0xe6ecff)],
  ["Void Garden", "Shadows bloom in every corner.", P(0x090914, 0x2a1f3f, 0x14122a, 0x1d1836, 0xc9b8ff)],
  ["Celestial Crown", "An ascent above the clouds.", P(0x1a1206, 0x7d5a12, 0x33230a, 0x4a3310, 0xfff3b0)],
  ["Moonlit Bay", "Tides whisper under the ledges.", P(0x0a1526, 0x1d3f6b, 0x122540, 0x18325a, 0xdfe9ff)],
  ["Bamboo Drift", "Green stalks sway with the shadows.", P(0x0d1b14, 0x265138, 0x14301f, 0x1c4029, 0xe6ffd6)],
  ["Crimson Shrine", "Gates of red, guardians of dusk.", P(0x260a10, 0x6d1c2b, 0x3c1018, 0x521622, 0xffc6c6)],
  ["Cinder Depths", "Heat rises from every gap.", P(0x1c0c08, 0x5e2410, 0x2f120a, 0x431a0d, 0xffb877)],
  ["Glacier Path", "One slip and the cold wins.", P(0x0a1d2a, 0x1c5470, 0x123544, 0x184a5e, 0xd6f7ff)],
  ["Starlight Pier", "Boards creak above the void.", P(0x0b0e22, 0x25306b, 0x131a3e, 0x1b2352, 0xd8dcff)],
  ["Emerald Vault", "Green light, greener greed.", P(0x08170f, 0x1c5a35, 0x0f3320, 0x14472a, 0xc8ffdb)],
  ["Amber Terrace", "Warm stone, cold company.", P(0x1e1206, 0x6b4712, 0x33220a, 0x48310e, 0xffe3a0)],
  ["Cobalt Rift", "The rift hums as you jump.", P(0x080f22, 0x1c3480, 0x0f1d44, 0x14275c, 0xbcd4ff)],
  ["Silver Cascade", "Waterfalls of moonlight.", P(0x111726, 0x40506b, 0x1c2338, 0x2a3450, 0xf2f7ff)],
  ["Obsidian Steps", "Black glass, thin footing.", P(0x0a0a0f, 0x24242e, 0x121218, 0x1a1a22, 0xbfc3d1)],
  ["Sunken Temple", "Ancient halls, restless shades.", P(0x081a1a, 0x1c5c58, 0x0f3535, 0x144a46, 0xc6fff7)],
  ["Ashen Fields", "Grey wind, grey wings.", P(0x161418, 0x4a4450, 0x241f28, 0x322c38, 0xe0dbe6)],
  ["Violet Expanse", "Purple skies stretch forever.", P(0x140a26, 0x431c72, 0x22103c, 0x2e1650, 0xdcc0ff)],
  ["Golden Aqueduct", "Arches of light and risk.", P(0x1c1608, 0x6b5714, 0x312a0c, 0x453b10, 0xfff0b0)],
  ["Nebula Halls", "Star dust drifts past the ledges.", P(0x0c0a20, 0x362a72, 0x181240, 0x221856, 0xd9c6ff)],
  ["Iron Cradle", "Machines sleep; shadows do not.", P(0x121418, 0x3a4450, 0x1c2128, 0x262d38, 0xd2dbe6)],
  ["Coral Abyss", "Beauty with teeth.", P(0x0a1626, 0x1c4a72, 0x122c44, 0x183a5c, 0xffd6e6)],
  ["Jade Colonnade", "Pillars stand where paths don't.", P(0x0a1a14, 0x1f5c46, 0x113329, 0x174735, 0xd6ffe9)],
  ["Solar Bulwark", "Blinding light, brutal jumps.", P(0x261a06, 0x8a5f10, 0x3f2b0a, 0x573b0d, 0xfff2c0)],
  ["Twilight Maze", "Every ledge looks the same.", P(0x120e26, 0x392a6b, 0x1e163c, 0x281d50, 0xdcd2ff)],
  ["Scarlet Verge", "The edge of the shadow realm.", P(0x260810, 0x7a1626, 0x3f0c18, 0x561120, 0xffc0cc)],
  ["Aurora Gate", "Ribbons of light, gaps of dark.", P(0x081a22, 0x1c6b5a, 0x0f3d36, 0x145248, 0xc6fff0)],
  ["Basalt Chasm", "Only nerve crosses this.", P(0x0e0e12, 0x333340, 0x18181f, 0x22222c, 0xc8ccd8)],
  ["Prism Sanctum", "Light splits, so does the floor.", P(0x101026, 0x3a3a80, 0x1c1c44, 0x26265c, 0xe6e6ff)],
  ["Hollow Citadel", "Empty walls, watching eyes.", P(0x0f1016, 0x363a4c, 0x1b1d28, 0x252836, 0xd2d8e6)],
  ["Molten Gallery", "Art carved by fire.", P(0x220c06, 0x7a2c0e, 0x3c150a, 0x521e0c, 0xffb066)],
  ["Zephyr Heights", "The wind wants you down.", P(0x0c1622, 0x2c5480, 0x162a44, 0x1e3a5c, 0xd6e9ff)],
  ["Umbral Bastion", "Shadows fortified.", P(0x0a0812, 0x2c2440, 0x140f22, 0x1c162e, 0xc0b6d8)],
  ["Radiant Spiral", "Up, always up.", P(0x1e1a06, 0x7a6a12, 0x332c0a, 0x47400e, 0xfff6c0)],
  ["Eclipse Court", "Daylight forfeited.", P(0x0a0a14, 0x2a2440, 0x141222, 0x1c182e, 0xb6b0d8)],
  ["Tempest Reach", "Thunder marks the beat.", P(0x0a0e1e, 0x243a80, 0x121c40, 0x1a2658, 0xcfdcff)],
  ["Frozen Crown", "The summit refuses guests.", P(0x0c1e2c, 0x246080, 0x143c4c, 0x1a5266, 0xe6fbff)],
  ["Phantom Vault", "Locks that only shadows open.", P(0x0e0a1a, 0x362a5c, 0x1a1436, 0x241c48, 0xcabaff)],
  ["Titan Steps", "Built for giants, not for Parth.", P(0x161208, 0x54481a, 0x282010, 0x3a2f16, 0xffe8a8)],
  ["Abyssal Bloom", "Flowers that feed on light.", P(0x080f1a, 0x1c3a5c, 0x0f2036, 0x142c48, 0xb6e6ff)],
  ["Astral Bridge", "One narrow span to the stars.", P(0x0a0c22, 0x2c3480, 0x161a44, 0x1e245c, 0xdde2ff)],
  ["Shadow Nexus", "Where every darkness meets.", P(0x08060e, 0x241c36, 0x100c1c, 0x181228, 0xa89ccc)],
  ["Dawn Threshold", "First light, last trial.", P(0x261406, 0x8a4a12, 0x3f210a, 0x572d0e, 0xffdca0)],
  ["Infinity Zenith", "Nothing above but victory.", P(0x14061e, 0x6b1c8a, 0x2c0f3f, 0x3e1657, 0xf0c6ff)],
];

export const LEVELS: LevelConfig[] = SEEDS.map(([name, tagline, palette], i) => {
  const t = i / (SEEDS.length - 1); // 0 → 1 difficulty ramp
  return {
    id: i + 1,
    name,
    tagline,
    tiles: 34 + i * 2,
    gaps: 2 + Math.floor(i / 3.2),
    platforms: 8 + Math.floor(i * 0.55),
    monsters: 3 + Math.floor(i * 0.42),
    monsterRange: [90 + Math.round(t * 130), 150 + Math.round(t * 220)] as [number, number],
    crystals: 3 + Math.floor(i / 6),
    seed: 1337 + i * 7919,
    palette,
  };
});



export const TOTAL_LEVELS = LEVELS.length;

export function getLevel(index: number): LevelConfig {
  return LEVELS[Math.min(Math.max(index, 0), LEVELS.length - 1)]!;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Layout = {
  ground: Seg[];
  platforms: Platform[];
  coins: Point[];
  crystals: Point[];
  monsters: Monster[];
  /** Surprise pop-up obstacles buried in the ground (tileX only). */
  lurkers: number[];
  /** Surprise pop-up obstacles hiding on platforms/steps. */
  platformLurkers: Point[];
  /** Flying monsters that sweep the air. */
  flyers: Monster[];
};

/** Builds a playable, deterministic layout for a level config. */
export function buildLayout(cfg: LevelConfig, groundY: number): Layout {
  const rnd = mulberry32(cfg.seed);
  const pick = (min: number, max: number) => min + rnd() * (max - min);
  const pickInt = (min: number, max: number) => Math.round(pick(min, max));

  // --- ground segments with gaps ---
  const ground: Seg[] = [];
  let cursor = 0;
  const safeStart = 8; // always solid ground at spawn
  ground.push([0, safeStart]);
  cursor = safeStart;
  for (let i = 0; i < cfg.gaps; i++) {
    const gap = pickInt(2, 3);
    const run = pickInt(5, 9);
    const start = cursor + gap;
    const end = Math.min(start + run, cfg.tiles);
    if (start >= cfg.tiles - 4) break;
    ground.push([start, end]);
    cursor = end;
  }
  if (cursor < cfg.tiles) ground.push([Math.min(cursor + 2, cfg.tiles - 6), cfg.tiles]);

  // --- floating platforms: reachable staircase (each hop <= jump height) ---
  const MAX_RISE = 96; // player can clear ~150px, keep hops comfortable
  const MIN_Y = groundY - 340;
  const platforms: Platform[] = [];
  const step = (cfg.tiles - 6) / cfg.platforms;
  let prevY = groundY;
  for (let i = 0; i < cfg.platforms; i++) {
    const tx = 3 + i * step + pick(-0.3, 0.3);
    let y = prevY - pickInt(60, MAX_RISE);
    if (y < MIN_Y) y = groundY - pickInt(60, MAX_RISE); // start a new flight from the ground
    platforms.push([Number(tx.toFixed(2)), Math.round(y), pickInt(2, 4)]);
    prevY = y;
  }

  // --- coins: clusters above platforms + a few on the ground ---
  const coins: Point[] = [];
  platforms.forEach(([tx, y, tiles]) => {
    const count = pickInt(2, 3);
    for (let i = 0; i < count; i++) {
      coins.push([Number((tx + 0.4 + i * (tiles / (count + 0.2))).toFixed(2)), y - 42]);
    }
  });
  ground.forEach(([start, end]) => {
    const mid = (start + end) / 2;
    coins.push([Number(mid.toFixed(2)), groundY - 60]);
  });

  // --- crystals on the highest platforms, plus one near the finish ---
  const highest = [...platforms].sort((a, b) => a[1] - b[1]).slice(0, cfg.crystals - 1);
  const crystals: Point[] = highest.map(([tx, y, tiles]) => [
    Number((tx + tiles / 2).toFixed(2)),
    y - 56,
  ]);
  const last = ground[ground.length - 1]!;
  crystals.push([Number((last[1] - 1.5).toFixed(2)), groundY - 70]);

  // --- monsters patrolling ground runs and wide platforms ---
  const monsters: Monster[] = [];
  const groundRuns = ground.filter(([s, e]) => e - s >= 4 && s > safeStart - 2);
  let gi = 0;
  while (monsters.length < cfg.monsters && groundRuns.length > 0) {
    const run = groundRuns[gi % groundRuns.length]!;
    const range = pickInt(cfg.monsterRange[0], cfg.monsterRange[1]);
    monsters.push([Number((run[0] + 1).toFixed(2)), groundY - 60, range]);
    gi++;
    if (gi > cfg.monsters * 2) break;
  }
  platforms
    .filter(([, , tiles]) => tiles >= 3)
    .slice(0, Math.max(0, cfg.monsters - monsters.length))
    .forEach(([tx, y, tiles]) =>
      monsters.push([tx + 0.4, y - 40, Math.max(60, (tiles - 1) * 64)]),
    );

  // --- surprise lurkers buried inside long ground runs ---
  const lurkers: number[] = [];
  const lurkerCount = 1 + Math.floor(cfg.id / 6);
  const longRuns = ground.filter(([s, e]) => e - s >= 4 && s > safeStart);
  for (let i = 0; i < lurkerCount && longRuns.length > 0; i++) {
    const run = longRuns[i % longRuns.length]!;
    lurkers.push(Number(pick(run[0] + 1.5, run[1] - 1).toFixed(2)));
  }

  // --- surprise lurkers hiding on the steps (wider platforms) ---
  const platformLurkers: Point[] = [];
  const stepCount = 1 + Math.floor(cfg.id / 5);
  const wideSteps = platforms.filter(([, , tiles]) => tiles >= 2);
  for (let i = 0; i < stepCount && wideSteps.length > 0; i++) {
    const [tx, y, tiles] = wideSteps[(i * 2 + 1) % wideSteps.length]!;
    platformLurkers.push([Number((tx + tiles / 2).toFixed(2)), y]);
  }

  // --- flying monsters: sweep the air above the path ---
  const flyers: Monster[] = [];
  const flyerCount = 1 + Math.floor(cfg.id / 7);
  for (let i = 0; i < flyerCount; i++) {
    const tx = Number((6 + ((cfg.tiles - 10) * (i + 0.5)) / flyerCount).toFixed(2));
    const y = Math.round(groundY - pick(170, 300));
    flyers.push([tx, y, pickInt(cfg.monsterRange[0] + 40, cfg.monsterRange[1] + 90)]);
  }

  // --- keep the airspace above every surprise monster clear ---
  const blockers: Point[] = [
    ...lurkers.map((tx) => [tx, groundY] as Point),
    ...platformLurkers,
  ];
  const clearAbove = (tx: number, y: number) =>
    !blockers.some(([bx, by]) => Math.abs(tx - bx) < 1.2 && y <= by + 8 && y > by - 260);

  return {
    ground,
    platforms,
    coins: coins.filter(([tx, y]) => clearAbove(tx, y)),
    crystals: crystals.filter(([tx, y]) => clearAbove(tx, y)),
    monsters: monsters.filter(([tx, y]) => clearAbove(tx, y)),
    lurkers,
    platformLurkers,
    flyers,
  };
}
