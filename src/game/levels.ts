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

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Twilight Valley",
    tagline: "Gentle hills and curious shadows.",
    tiles: 34,
    gaps: 2,
    platforms: 8,
    monsters: 3,
    monsterRange: [90, 150],
    crystals: 3,
    seed: 1337,
    palette: {
      skyTop: 0x151129,
      skyBottom: 0x3a2a55,
      hillFar: 0x241c3d,
      hillNear: 0x2e2450,
      moon: 0xfdf1c7,
    },
  },
  {
    id: 2,
    name: "Lantern Woods",
    tagline: "Higher ledges, wider leaps.",
    tiles: 40,
    gaps: 3,
    platforms: 10,
    monsters: 5,
    monsterRange: [110, 180],
    crystals: 4,
    seed: 4242,
    palette: {
      skyTop: 0x0f1a24,
      skyBottom: 0x21463c,
      hillFar: 0x16302c,
      hillNear: 0x1e463b,
      moon: 0xd8f5c7,
    },
  },
  {
    id: 3,
    name: "Sakura Ridge",
    tagline: "Petals drift over hungry gaps.",
    tiles: 46,
    gaps: 4,
    platforms: 12,
    monsters: 6,
    monsterRange: [120, 210],
    crystals: 5,
    seed: 9091,
    palette: {
      skyTop: 0x2a1024,
      skyBottom: 0x64304c,
      hillFar: 0x421e36,
      hillNear: 0x5a2b46,
      moon: 0xffd9e8,
    },
  },
  {
    id: 4,
    name: "Storm Bastion",
    tagline: "Fast shadows patrol the towers.",
    tiles: 52,
    gaps: 5,
    platforms: 14,
    monsters: 8,
    monsterRange: [140, 240],
    crystals: 5,
    seed: 20250,
    palette: {
      skyTop: 0x101426,
      skyBottom: 0x243a63,
      hillFar: 0x1a2445,
      hillNear: 0x243259,
      moon: 0xcfe4ff,
    },
  },
  {
    id: 5,
    name: "Ember Summit",
    tagline: "The final climb. Do not look down.",
    tiles: 58,
    gaps: 6,
    platforms: 16,
    monsters: 10,
    monsterRange: [150, 260],
    crystals: 6,
    seed: 77777,
    palette: {
      skyTop: 0x240f14,
      skyBottom: 0x6b2a1e,
      hillFar: 0x3d1618,
      hillNear: 0x552019,
      moon: 0xffd08a,
    },
  },
];

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

  return { ground, platforms, coins, crystals, monsters };
}
