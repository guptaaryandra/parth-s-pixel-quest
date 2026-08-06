/**
 * Layered, themed parallax backdrop.
 *
 * Everything is generated procedurally into a few seamless 512px-wide textures
 * per biome (cached by theme key, so 50 levels only build 15 texture sets) and
 * drawn with TileSprites pinned to the camera viewport. Scrolling moves
 * `tilePositionX` only — no per-frame object churn, so it stays cheap on mobile.
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
  /** Sparkles, fireflies. */
  accent2: number;
  mist: number;
};

export const BIOMES: Biome[] = [
  {
    key: "oak",
    name: "Enchanted Forest",
    skyTop: 0x140b2e,
    skyBottom: 0x2f2065,
    moon: 0xfff4cf,
    cloud: 0x4a3a7a,
    far: 0x1b2b52,
    mid: 0x14442f,
    trunk: 0x30203a,
    near: 0x1a6b3f,
    nearLight: 0x2fa35a,
    accent: 0xffd166,
    accent2: 0x7bf1c8,
    mist: 0x7fd8ff,
  },
  {
    key: "jungle",
    name: "Ancient Jungle",
    skyTop: 0x061c26,
    skyBottom: 0x0f4a4a,
    moon: 0xd9fff0,
    cloud: 0x1d6a63,
    far: 0x11333c,
    mid: 0x11503c,
    trunk: 0x2b2418,
    near: 0x18744a,
    nearLight: 0x35b06a,
    accent: 0xffb347,
    accent2: 0x64ffd0,
    mist: 0x9bf3e0,
  },
  {
    key: "pine",
    name: "Mystic Woods",
    skyTop: 0x0d1030,
    skyBottom: 0x243a72,
    moon: 0xe6ecff,
    cloud: 0x3b4c8a,
    far: 0x1a2148,
    mid: 0x1333४2 as never,
    trunk: 0x241d33,
    near: 0x155744,
    nearLight: 0x2b8f6a,
    accent: 0xa4c7ff,
    accent2: 0x8affd8,
    mist: 0xbcd8ff,
  },
];
