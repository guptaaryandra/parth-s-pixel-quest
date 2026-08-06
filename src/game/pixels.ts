/**
 * Tiny pixel-art helper: turns character maps into Phaser textures at runtime.
 * Keeps the game asset-free while staying true pixel art.
 */
import type Phaser from "phaser";

export type Palette = Record<string, string>;

export function drawPixelTexture(
  scene: Phaser.Scene,
  key: string,
  map: string[],
  palette: Palette,
  scale = 3,
) {
  if (scene.textures.exists(key)) return;
  const w = map[0]!.length;
  const h = map.length;
  const canvasTexture = scene.textures.createCanvas(key, w * scale, h * scale);
  if (!canvasTexture) return;
  const ctx = canvasTexture.getContext();
  ctx.clearRect(0, 0, w * scale, h * scale);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = map[y]![x]!;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  canvasTexture.refresh();
}

const SKIN = "#f6c7a4";
const HAIR = "#2b2140";
const HAIR2 = "#3d3159";
const COAT = "#2fb6a8";
const COAT2 = "#1e8c85";
const PANTS = "#33406b";
const BOOT = "#1c2338";
const EYE = "#141a2b";
const SCARF = "#ef5f78";

export const HERO_PALETTE: Palette = {
  h: HAIR,
  H: HAIR2,
  s: SKIN,
  e: EYE,
  c: COAT,
  C: COAT2,
  p: PANTS,
  b: BOOT,
  r: SCARF,
};

const heroIdle = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "..hHhhhhhhHh..",
  "..hssssssssh..",
  "..hsesssssesh.",
  "...ssssssssh..",
  "...ssssssss...",
  "....rrrrrr....",
  "...cccccccc...",
  "..sccccccccs..",
  "..scccCCcccs..",
  "...cccCCccc...",
  "....pppppp....",
  "....pp..pp....",
  "....pp..pp....",
  "...bbb..bbb...",
];

const heroRunA = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "..hHhhhhhhHh..",
  "..hssssssssh..",
  "..hsesssssesh.",
  "...ssssssssh..",
  "...ssssssss...",
  "....rrrrrrr...",
  "...cccccccc...",
  "..scccccccc...",
  ".sccccCCcccs..",
  "...cccCCccc...",
  "....pppppp....",
  "...pp....pp...",
  "..pp......pp..",
  ".bbb.......bbb",
];

const heroRunB = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "..hHhhhhhhHh..",
  "..hssssssssh..",
  "..hsesssssesh.",
  "...ssssssssh..",
  "...ssssssss...",
  "...rrrrrrr....",
  "...cccccccc...",
  "...cccccccccs.",
  "..scccCCcccs..",
  "...cccCCccc...",
  "....pppppp....",
  "....pppppp....",
  "....pp.pp.....",
  "...bbb.bbb....",
];

const heroJump = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "..hHhhhhhhHh..",
  "..hssssssssh..",
  "..hsesssssesh.",
  "...ssssssssh..",
  "...ssssssss...",
  "..rrrrrrrrr...",
  "s..cccccccc..s",
  "s.scccccccc.s.",
  "..scccCCcccs..",
  "...cccCCccc...",
  "....pppppp....",
  "...pp....pp...",
  "..bbb....bbb..",
  "..............",
];

const monsterA = [
  "...mmmmmmmm...",
  "..mmmmmmmmmm..",
  ".mmmmmmmmmmmm.",
  ".mmwwmmmmwwmm.",
  ".mmwpmmmmwpmm.",
  ".mmmmmmmmmmmm.",
  ".mmmmggggmmmm.",
  ".mmmmmmmmmmmm.",
  "..mmmmmmmmmm..",
  "...mmmmmmmm...",
  "..m..m..m..m..",
  ".m...m..m...m.",
];

const monsterB = [
  "..............",
  "...mmmmmmmm...",
  "..mmmmmmmmmm..",
  ".mmwwmmmmwwmm.",
  ".mmwpmmmmwpmm.",
  ".mmmmmmmmmmmm.",
  ".mmmmggggmmmm.",
  ".mmmmmmmmmmmm.",
  ".mmmmmmmmmmmm.",
  "..mmmmmmmmmm..",
  "..mm..mm..mm..",
  ".mm...mm...mm.",
];

const MONSTER_PALETTE: Palette = {
  m: "#3a2f5c",
  w: "#f4f7ff",
  p: "#2a2340",
  g: "#ef5f78",
};

const coinFrames = [
  [
    "..cccc..",
    ".cyyyyc.",
    "cyywwyyc",
    "cyywwyyc",
    "cyywwyyc",
    "cyywwyyc",
    ".cyyyyc.",
    "..cccc..",
  ],
  [
    "...cc...",
    "..cyyc..",
    "..cywc..",
    "..cywc..",
    "..cywc..",
    "..cywc..",
    "..cyyc..",
    "...cc...",
  ],
];

const COIN_PALETTE: Palette = { c: "#a86a12", y: "#ffc94a", w: "#fff2b8" };

const crystal = [
  "...bb...",
  "..bwwb..",
  ".bwllwb.",
  "bwllllwb",
  "bllllllb",
  ".bllllb.",
  "..blib..",
  "...bb...",
];

const CRYSTAL_PALETTE: Palette = {
  b: "#1c5f9e",
  w: "#dff6ff",
  l: "#49c9f5",
  i: "#8fe6ff",
};

const groundTile = [
  "gggggggggggggggg",
  "gGgggGgggggGgggg",
  "dddddddddddddddd",
  "ddDdddddDdddddDd",
  "dddddddddddddddd",
  "dddDddddddddDddd",
  "dddddddddddddddd",
  "ddDddddddDdddddd",
];

const GROUND_PALETTE: Palette = {
  g: "#3fbf8f",
  G: "#5fe0ae",
  d: "#4a3b63",
  D: "#5d4b79",
};

const platformTile = [
  "cCCCCCCCCCCCCCCc",
  "cCCCCCCCCCCCCCCc",
  "cnnnnnnnnnnnnnnc",
  "cnnnnnnnnnnnnnnc",
  "cnnnnnnnnnnnnnnc",
  "cccccccccccccccc",
];

const PLATFORM_PALETTE: Palette = {
  c: "#2f2748",
  C: "#7de1ff",
  n: "#463a6b",
};

/** Surprise "lurker" — hides under the ground with only its horns peeking out. */
const lurker = [
  "..............",
  "...LL....LL...",
  "..LLLL..LLLL..",
  ".LLLLLLLLLLLL.",
  "LLLLLLLLLLLLLL",
  "LLwwLLLLLLwwLL",
  "LLwpLLLLLLwpLL",
  "LLLLLLLLLLLLLL",
  "LLLtttttttLLLL",
  "LLLtLtLtLtLLLL",
  ".LLLLLLLLLLLL.",
  "..LLLLLLLLLL..",
  "...LLLLLLLL...",
  "..LL..LL..LL..",
  ".LL...LL...LL.",
  "..............",
];

const LURKER_PALETTE: Palette = {
  L: "#5a2340",
  w: "#fff2b8",
  p: "#2a1020",
  t: "#ffd9e8",
};

/** Flying shadow bat — two wing frames. */
const flyerA = [
  "..............",
  "ff..........ff",
  "fFf........fFf",
  "fFFf..bb..fFFf",
  ".fFFfbbbbfFFf.",
  "..fFbbwwbbFf..",
  "...bbwpwpbb...",
  "...bbbbbbbb...",
  "....bb..bb....",
  "..............",
];

const flyerB = [
  "..............",
  "..............",
  "....bb..bb....",
  "ff...bbbb...ff",
  "fFf.bbbbbb.fFf",
  "fFFfbbwwbbfFFf",
  ".fFbbwpwpbbFf.",
  "..fbbbbbbbbf..",
  "....bb..bb....",
  "..............",
];

const FLYER_PALETTE: Palette = {
  b: "#2f2545",
  f: "#4a3a6b",
  F: "#6b53a0",
  w: "#fff2b8",
  p: "#1a1226",
};

export function buildTextures(scene: Phaser.Scene, heroColors: Palette = {}) {
  const hero: Palette = { ...HERO_PALETTE, ...heroColors };
  drawPixelTexture(scene, "parth-idle", heroIdle, hero);
  drawPixelTexture(scene, "parth-run-a", heroRunA, hero);
  drawPixelTexture(scene, "parth-run-b", heroRunB, hero);
  drawPixelTexture(scene, "parth-jump", heroJump, hero);

  drawPixelTexture(scene, "monster-a", monsterA, MONSTER_PALETTE);
  drawPixelTexture(scene, "monster-b", monsterB, MONSTER_PALETTE);
  drawPixelTexture(scene, "lurker", lurker, LURKER_PALETTE);
  drawPixelTexture(scene, "flyer-a", flyerA, FLYER_PALETTE);
  drawPixelTexture(scene, "flyer-b", flyerB, FLYER_PALETTE);
  drawPixelTexture(scene, "coin-a", coinFrames[0]!, COIN_PALETTE, 4);
  drawPixelTexture(scene, "coin-b", coinFrames[1]!, COIN_PALETTE, 4);
  drawPixelTexture(scene, "crystal", crystal, CRYSTAL_PALETTE, 4);
  drawPixelTexture(scene, "ground", groundTile, GROUND_PALETTE, 4);
  drawPixelTexture(scene, "platform", platformTile, PLATFORM_PALETTE, 4);
}
