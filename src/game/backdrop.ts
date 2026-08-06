/**
 * Layered, themed parallax backdrop.
 *
 * Everything is generated procedurally into a handful of seamless 512px-wide
 * textures per biome (cached by theme key, so 50 levels only ever build 15 sets)
 * and drawn with TileSprites pinned to the camera viewport. Scrolling is done by
 * moving `tilePositionX` — no per-frame object churn, so it stays cheap on mobile.
 */
import Phaser from "phaser";

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
  /** Farthest tree/rock band (most desaturated). */
  far: number;
  /** Middle tree band. */
  mid: number;
  /** Trunk / structure colour. */
  trunk: number;
  /** Near foliage band. */
  near: number;
  /** Highlight on near foliage. */
  nearLight: number;
  /** Flowers, glows, lanterns. */
  accent: number;
  /** Second accent for sparkles / berries. */
  accent2: number;
  mist: number;
  spark: number;
};

const B = (
  key: Feature,
  name: string,
  c: [number, number, number, number, number, number, number, number, number, number, number, number, number],
): Biome => ({
  key,
  name,
  skyTop: c[0],
  skyBottom: c[1],
  moon: c[2],
  cloud: c[3],
  far: c[4],
  mid: c[5],
  trunk: c[6],
  near: c[7],
  nearLight: c[8],
  accent: c[9],
  accent2: c[10],
  mist: c[11],
  spark: c[12],
});

export const BIOMES: Biome[] = [
  B("oak", "Enchanted Forest", [
    0x120b2e, 0x2b1c5c, 0xfff3c7, 0x6d5aa8, 0x1d2a4a, 0x1c5140, 0x2c1f2e, 0x18people => 0, 0, 0, 0, 0, 0,
  ] as never),
];
