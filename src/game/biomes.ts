/** Biome palettes and map-cycle data. Browser-safe: no Phaser import. */

export type Feature =
  | "pine"
  | "oak"
  | "jungle"
  | "blossom"
  | "crystal"
  | "frozen"
  | "autumn"
  | "haunted"
  | "temple"
  | "islands"
  | "waterfall"
  | "mushroom"
  | "bamboo"
  | "oasis"
  | "volcano";

export type Biome = {
  key: Feature;
  name: string;
  skyTop: number;
  skyBottom: number;
  moon: number;
  cloud: number;
  far: number;
  mid: number;
  trunk: number;
  near: number;
  nearLight: number;
  accent: number;
  accent2: number;
  mist: number;
  /** Tint applied to ground/platform tiles so terrain matches the map design. */
  terrainTint: number;
};

type Row = [
  Feature,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

// key, name, skyTop, skyBottom, moon, cloud, far, mid, trunk, near, nearLight, accent, accent2, mist
const ROWS: Row[] = [
  ["oak", "Enchanted Forest", 0x140b2e, 0x2f2065, 0xfff4cf, 0x4a3a7a, 0x1b2b52, 0x14442f, 0x30203a, 0x1a6b3f, 0x2fa35a, 0xffd166, 0x7bf1c8, 0x7fd8ff],
  ["jungle", "Ancient Jungle", 0x061c26, 0x0f4a4a, 0xd9fff0, 0x1d6a63, 0x11333c, 0x11503c, 0x2b2418, 0x18744a, 0x35b06a, 0xffb347, 0x64ffd0, 0x9bf3e0],
  ["pine", "Mystic Woods", 0x0d1030, 0x243a72, 0xe6ecff, 0x3b4c8a, 0x1a2148, 0x133342, 0x241d33, 0x155744, 0x2b8f6a, 0xa4c7ff, 0x8affd8, 0xbcd8ff],
  ["blossom", "Cherry Blossom Valley", 0x2a1030, 0x5e2b52, 0xffe3f2, 0x8a4a75, 0x3d1c3f, 0x6b2f52, 0x3a2230, 0x9c4570, 0xe07aa8, 0xffc2dd, 0xfff0a8, 0xffd6ea],
  ["crystal", "Crystal Caverns", 0x120833, 0x33116b, 0xd8b6ff, 0x4a2088, 0x1e1046, 0x2c1a5c, 0x241539, 0x3a2170, 0x6a3fb0, 0x66f0ff, 0xff7bd5, 0xb98cff],
  ["frozen", "Frozen Forest", 0x0a1c30, 0x1f4f74, 0xeafaff, 0x396f96, 0x14324a, 0x1b5063, 0x24303d, 0x246f7f, 0x49a8b6, 0xcdf4ff, 0x9be8ff, 0xdff6ff],
  ["autumn", "Autumn Forest", 0x24120e, 0x6b3218, 0xffe0a8, 0x8a5330, 0x3a1e14, 0x7a3f14, 0x38231a, 0x9c5a17, 0xd18a26, 0xffb347, 0xff7a45, 0xffd9a8],
  ["haunted", "Haunted Woods", 0x0a0912, 0x241f36, 0xbfd6c0, 0x332c48, 0x14121f, 0x1c2620, 0x1e1a24, 0x223027, 0x3c5a3f, 0x8dff9e, 0xb98cff, 0x9fb8a8],
  ["temple", "Ancient Temple", 0x1a1226, 0x4a3355, 0xffeccf, 0x6b4a70, 0x2a2036, 0x3d3348, 0x4a3f52, 0x2f5a44, 0x4e8f5f, 0xffd98a, 0x7be0ff, 0xd9c8e6],
  ["islands", "Floating Islands", 0x101a3f, 0x2b4a8a, 0xfff0d6, 0x4a6bb0, 0x1e2f5c, 0x1e5a52, 0x2e2740, 0x22785c, 0x3fae7e, 0xffe08a, 0x8ad8ff, 0xc4e0ff],
  ["waterfall", "Waterfall Valley", 0x0a1a2e, 0x1c4a6b, 0xdff0ff, 0x2f6b8a, 0x123146, 0x15503f, 0x26262e, 0x1a6b52, 0x2f9e73, 0xa8f0ff, 0xffe08a, 0xbdf0ff],
  ["mushroom", "Magical Mushroom Forest", 0x160a2c, 0x3d1a5e, 0xf0d6ff, 0x5a2a80, 0x22143f, 0x2f2350, 0x2c1f36, 0x3f2a5e, 0x5f3f8a, 0xff6fae, 0x66ffd5, 0xc4a0ff],
  ["bamboo", "Bamboo Forest", 0x0c1a1a, 0x1f4a38, 0xe6ffd6, 0x2f6b4a, 0x143026, 0x1c5033, 0x2a3a1e, 0x2c6b33, 0x4f9c46, 0xdaff8a, 0x8affd0, 0xcdf0d6],
  ["oasis", "Desert Oasis", 0x1c1430, 0x6b4a52, 0xffe8bf, 0x8a6a63, 0x33263a, 0x6b5340, 0x4a3524, 0x1f6b4f, 0x3f9c63, 0xffd166, 0x7be0ff, 0xffddb0],
  ["volcano", "Volcanic Highlands", 0x1c0812, 0x5e1a1a, 0xffcf9e, 0x7a2a24, 0x2a1018, 0x3d1a18, 0x2e1a1a, 0x4a2018, 0x7a3320, 0xff8a3d, 0xffd166, 0xff9e7a],
];

export const BIOMES: Biome[] = ROWS.map((r) => ({
  key: r[0],
  name: r[1],
  skyTop: r[2],
  skyBottom: r[3],
  moon: r[4],
  cloud: r[5],
  far: r[6],
  mid: r[7],
  trunk: r[8],
  near: r[9],
  nearLight: r[10],
  accent: r[11],
  accent2: r[12],
  mist: r[13],
  terrainTint: r[9],
}));

/**
 * Ten distinct map designs, cycled every ten levels:
 * levels 1-10 use them in order, 11-20 repeat the same ten, and so on.
 */
export const MAP_CYCLE: Feature[] = [
  "oak", // 1 Twilight Valley
  "jungle", // 2 Lantern Woods
  "blossom", // 3 Sakura Ridge
  "temple", // 4 Storm Bastion
  "volcano", // 5 Ember Summit
  "frozen", // 6 Frost Hollow
  "crystal", // 7 Neon Bazaar
  "waterfall", // 8 Thunder Spires
  "mushroom", // 9 Void Garden
  "bamboo", // 10 Celestial Crown
];

const BY_KEY = new Map<Feature, Biome>(BIOMES.map((b) => [b.key, b]));

/** Map design for a level index (0-based); repeats every 10 levels. */
export function biomeFor(levelIndex: number): Biome {
  const key = MAP_CYCLE[((levelIndex % MAP_CYCLE.length) + MAP_CYCLE.length) % MAP_CYCLE.length]!;
  return BY_KEY.get(key) ?? BIOMES[0]!;
}

