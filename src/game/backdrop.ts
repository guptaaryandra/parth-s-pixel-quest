/**
 * Layered, themed parallax backdrop.
 *
 * Every layer is generated procedurally into seamless 512px-wide textures per
 * biome (cached by theme key, so 50 levels only build 15 texture sets) and drawn
 * with TileSprites pinned to the camera viewport. Scrolling only moves
 * `tilePositionX`, so the whole backdrop costs a handful of draw calls.
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
  far: number;
  mid: number;
  trunk: number;
  near: number;
  nearLight: number;
  accent: number;
  accent2: number;
  mist: number;
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
}));

/** Stable, spread-out biome for a level index (0-based). */
export function biomeFor(levelIndex: number): Biome {
  return BIOMES[levelIndex % BIOMES.length]!;
}

function rng(seed: number) {
  let a = (seed || 1) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TW = 512;

type G = Phaser.GameObjects.Graphics;

/** Blend a colour toward white (moonlight rim) or black (depth). */
function shade(color: number, amt: number) {
  const c = Phaser.Display.Color.IntegerToColor(color);
  const t = amt >= 0 ? 255 : 0;
  const k = Math.abs(amt);
  return Phaser.Display.Color.GetColor(
    Math.round(c.red + (t - c.red) * k),
    Math.round(c.green + (t - c.green) * k),
    Math.round(c.blue + (t - c.blue) * k),
  );
}

/** Chunky pixel blob — a few overlapping rects, keeps the pixel-art feel. */
function blob(g: G, x: number, y: number, r: number) {
  g.fillRect(x - r, y - r * 0.6, r * 2, r * 1.2);
  g.fillRect(x - r * 0.7, y - r, r * 1.4, r * 2);
  g.fillRect(x - r * 0.9, y - r * 0.85, r * 1.8, r * 1.7);
}

/** Wraps drawing so anything near an edge repeats on the other side. */
function tiled(x: number, draw: (x: number) => void) {
  draw(x);
  if (x < 120) draw(x + TW);
  if (x > TW - 120) draw(x - TW);
}

export class Backdrop {
  private scene: Phaser.Scene;
  private biome: Biome;
  private groundY: number;
  private worldH: number;

  private sky!: Phaser.GameObjects.Image;
  private stars!: Phaser.GameObjects.TileSprite;
  private moon!: Phaser.GameObjects.Arc;
  private moonGlow!: Phaser.GameObjects.Arc;
  private clouds!: Phaser.GameObjects.TileSprite;
  private ridge!: Phaser.GameObjects.TileSprite;
  private treesFar!: Phaser.GameObjects.TileSprite;
  private treesMid!: Phaser.GameObjects.TileSprite;
  private props!: Phaser.GameObjects.TileSprite;
  private foliage!: Phaser.GameObjects.TileSprite;
  private mist!: Phaser.GameObjects.TileSprite;
  private fg!: Phaser.GameObjects.TileSprite;
  private motes: Phaser.GameObjects.Arc[] = [];
  private size: { w: number; h: number } | null = null;

  constructor(scene: Phaser.Scene, biome: Biome, groundY: number, worldH: number) {
    this.scene = scene;
    this.biome = biome;
    this.groundY = groundY;
    this.worldH = worldH;
    this.build();
  }

  // ---------- texture builders ----------

  private tex(name: string, h: number, draw: (g: G, rnd: () => number) => void) {
    const key = `bd-${this.biome.key}-${name}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
      let seed = 7;
      for (let i = 0; i < this.biome.key.length; i++) seed = seed * 31 + this.biome.key.charCodeAt(i);
      for (let i = 0; i < name.length; i++) seed = seed * 17 + name.charCodeAt(i);
      draw(g, rng(seed));
      g.generateTexture(key, TW, h);
      g.destroy();
    }
    return key;
  }

  private skyKey() {
    const key = `bd-${this.biome.key}-sky`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillGradientStyle(
        this.biome.skyTop,
        this.biome.skyTop,
        this.biome.skyBottom,
        this.biome.skyBottom,
        1,
      );
      g.fillRect(0, 0, 16, this.worldH);
      g.generateTexture(key, 16, this.worldH);
      g.destroy();
    }
    return key;
  }

  private starsKey() {
    const key = "bd-stars";
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
      const rnd = rng(4242);
      for (let i = 0; i < 150; i++) {
        g.fillStyle(0xffffff, 0.2 + rnd() * 0.8);
        const s = rnd() > 0.85 ? 3 : 2;
        g.fillRect(Math.floor(rnd() * TW), Math.floor(rnd() * TW), s, s);
      }
      g.generateTexture(key, TW, TW);
      g.destroy();
    }
    return key;
  }

  private cloudsKey() {
    return this.tex("clouds", 200, (g, rnd) => {
      for (let i = 0; i < 7; i++) {
        const x = rnd() * TW;
        const y = 30 + rnd() * 110;
        const r = 14 + rnd() * 18;
        tiled(x, (cx) => {
          g.fillStyle(this.biome.cloud, 0.4);
          for (let k = -2; k <= 2; k++) blob(g, cx + k * r * 0.9, y + Math.abs(k) * 3, r * (1 - Math.abs(k) * 0.18));
        });
      }
    });
  }

  /** Distant silhouette band: rolling cliffs / plateaus — never pointy triangles. */
  private ridgeKey() {
    return this.tex("ridge", 260, (g, rnd) => {
      g.fillStyle(this.biome.far, 1);
      let x = 0;
      while (x < TW + 60) {
        const w = 70 + rnd() * 120;
        const top = 90 + rnd() * 110;
        g.fillRect(x, top, w, 260 - top);
        // soft shoulder blocks so silhouettes read organic, not triangular
        g.fillRect(x - 12, top + 16, w + 24, 260 - top - 16);
        if (rnd() > 0.55) {
          g.fillStyle(this.biome.far, 1);
          g.fillRect(x + w * 0.2, top - 18, w * 0.5, 20);
        }
        x += w * 0.8;
      }
      g.fillStyle(this.biome.far, 1);
      g.fillRect(0, 220, TW, 40);
    });
  }

  /** Themed tree/structure silhouette band. */
  private treeBand(name: string, h: number, color: number, count: number, scale: number) {
    const b = this.biome;
    return this.tex(name, h, (g, rnd) => {
      for (let i = 0; i < count; i++) {
        const x = (i + 0.5) * (TW / count) + (rnd() - 0.5) * 26;
        const s = scale * (0.78 + rnd() * 0.44);
        tiled(x, (cx) => this.drawTree(g, cx, h, s, color, rnd));
      }
      g.fillStyle(shade(color, -0.25), 1);
      g.fillRect(0, h - 10, TW, 10);
      void b;
    });
  }

  private drawTree(g: G, x: number, baseY: number, s: number, color: number, rnd: () => number) {
    const b = this.biome;
    const trunkH = 90 * s;
    const trunkW = Math.max(6, 16 * s);
    const top = baseY - trunkH;

    const drawTrunk = (c: number) => {
      g.fillStyle(c, 1);
      g.fillRect(x - trunkW / 2, top, trunkW, trunkH + 6);
    };

    switch (b.key) {
      case "pine":
      case "frozen": {
        drawTrunk(b.trunk);
        g.fillStyle(color, 1);
        const layers = 5;
        for (let i = 0; i < layers; i++) {
          const t = i / layers;
          const w = (86 - t * 58) * s;
          const y = top - 40 * s + i * 26 * s;
          g.fillRect(x - w / 2, y, w, 24 * s);
          g.fillStyle(shade(color, 0.22), 1);
          g.fillRect(x - w / 2, y, w * 0.55, 4 * s);
          g.fillStyle(color, 1);
        }
        break;
      }
      case "bamboo": {
        for (let i = 0; i < 3; i++) {
          const bx = x + (i - 1) * 16 * s;
          g.fillStyle(i === 1 ? color : b.trunk, 1);
          g.fillRect(bx - 4 * s, top - 70 * s, 8 * s, trunkH + 76 * s);
          g.fillStyle(color, 1);
          for (let k = 0; k < 5; k++) {
            const ly = top - 60 * s + k * 30 * s;
            g.fillRect(bx + 4 * s, ly, 22 * s, 4 * s);
            g.fillRect(bx - 26 * s, ly + 12 * s, 22 * s, 4 * s);
          }
        }
        break;
      }
      case "crystal": {
        g.fillStyle(color, 1);
        for (let i = 0; i < 3; i++) {
          const cx = x + (i - 1) * 22 * s;
          const hh = (60 + rnd() * 90) * s;
          g.fillRect(cx - 9 * s, baseY - hh, 18 * s, hh);
          g.fillRect(cx - 5 * s, baseY - hh - 14 * s, 10 * s, 16 * s);
        }
        g.fillStyle(b.accent, 0.5);
        g.fillRect(x - 3 * s, baseY - 120 * s, 6 * s, 90 * s);
        break;
      }
      case "temple": {
        g.fillStyle(color, 1);
        g.fillRect(x - 26 * s, baseY - 140 * s, 14 * s, 140 * s);
        g.fillRect(x + 12 * s, baseY - 118 * s, 14 * s, 118 * s);
        g.fillRect(x - 34 * s, baseY - 156 * s, 68 * s, 16 * s);
        g.fillStyle(b.near, 1);
        g.fillRect(x - 34 * s, baseY - 160 * s, 68 * s, 8 * s);
        break;
      }
      case "volcano": {
        g.fillStyle(color, 1);
        g.fillRect(x - 46 * s, baseY - 120 * s, 92 * s, 120 * s);
        g.fillRect(x - 30 * s, baseY - 150 * s, 60 * s, 40 * s);
        g.fillStyle(b.accent, 0.85);
        g.fillRect(x - 8 * s, baseY - 150 * s, 16 * s, 8 * s);
        break;
      }
      case "mushroom": {
        drawTrunk(b.trunk);
        g.fillStyle(color, 1);
        blob(g, x, top - 18 * s, 44 * s);
        g.fillStyle(b.accent, 0.85);
        for (let i = 0; i < 4; i++) {
          g.fillRect(x - 30 * s + i * 18 * s, top - 26 * s + (i % 2) * 10 * s, 8 * s, 8 * s);
        }
        break;
      }
      case "oasis": {
        drawTrunk(b.trunk);
        g.fillStyle(color, 1);
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 6) * i + Math.PI;
          g.fillRect(x + Math.cos(a) * 34 * s - 4, top + Math.sin(a) * 22 * s - 4, 40 * s, 8 * s);
        }
        break;
      }
      case "islands": {
        g.fillStyle(color, 1);
        const iy = baseY - (60 + rnd() * 120) * s;
        g.fillRect(x - 50 * s, iy, 100 * s, 22 * s);
        g.fillRect(x - 34 * s, iy + 22 * s, 68 * s, 18 * s);
        g.fillRect(x - 16 * s, iy + 40 * s, 32 * s, 16 * s);
        g.fillStyle(b.nearLight, 1);
        g.fillRect(x - 50 * s, iy - 6 * s, 100 * s, 8 * s);
        break;
      }
      case "waterfall": {
        g.fillStyle(color, 1);
        g.fillRect(x - 52 * s, baseY - 170 * s, 104 * s, 170 * s);
        g.fillStyle(b.accent, 0.5);
        g.fillRect(x - 12 * s, baseY - 150 * s, 24 * s, 150 * s);
        g.fillStyle(b.nearLight, 1);
        g.fillRect(x - 52 * s, baseY - 176 * s, 104 * s, 10 * s);
        break;
      }
      case "haunted": {
        drawTrunk(b.trunk);
        g.fillStyle(color, 1);
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.42;
          g.fillRect(x + Math.cos(a) * 30 * s, top + Math.sin(a) * 26 * s, 34 * s, 6 * s);
        }
        g.fillStyle(b.accent, 0.55);
        g.fillRect(x - 4, top - 6, 6, 6);
        break;
      }
      case "blossom":
      case "autumn":
      case "jungle":
      case "oak":
      default: {
        drawTrunk(b.trunk);
        // branches
        g.fillStyle(b.trunk, 1);
        g.fillRect(x - 30 * s, top + 18 * s, 30 * s, 6 * s);
        g.fillRect(x, top + 34 * s, 30 * s, 6 * s);
        // canopy: overlapping chunky blobs
        g.fillStyle(color, 1);
        blob(g, x, top - 26 * s, 44 * s);
        blob(g, x - 40 * s, top - 6 * s, 28 * s);
        blob(g, x + 40 * s, top - 10 * s, 30 * s);
        blob(g, x - 12 * s, top - 52 * s, 26 * s);
        // moonlit rim so canopies read as separate shapes, not one dark mass
        g.fillStyle(shade(color, 0.26), 1);
        g.fillRect(x - 34 * s, top - 66 * s, 46 * s, 7 * s);
        g.fillRect(x + 16 * s, top - 34 * s, 34 * s, 6 * s);
        g.fillRect(x - 58 * s, top - 26 * s, 26 * s, 6 * s);
        g.fillStyle(shade(color, -0.3), 1);
        g.fillRect(x - 22 * s, top - 2 * s, 60 * s, 6 * s);
        g.fillStyle(color, 1);
        // vines
        g.fillStyle(color, 0.9);
        for (let i = 0; i < 3; i++) {
          const vx = x - 34 * s + i * 32 * s;
          g.fillRect(vx, top + 6 * s, 4 * s, (26 + rnd() * 40) * s);
        }
        break;
      }
    }
  }

  /** Mid-ground props: rocks, ruins, bridges, logs, caves. */
  private propsKey() {
    const b = this.biome;
    return this.tex("props", 200, (g, rnd) => {
      for (let i = 0; i < 6; i++) {
        const x = (i + 0.5) * (TW / 6) + (rnd() - 0.5) * 30;
        tiled(x, (cx) => {
          const kind = i % 3;
          if (kind === 0) {
            // mossy boulders
            g.fillStyle(b.trunk, 1);
            blob(g, cx, 168, 26);
            g.fillStyle(b.nearLight, 1);
            g.fillRect(cx - 24, 146, 48, 7);
          } else if (kind === 1) {
            // ruin arch / wooden bridge
            g.fillStyle(b.mid, 1);
            g.fillRect(cx - 40, 120, 12, 68);
            g.fillRect(cx + 28, 120, 12, 68);
            g.fillRect(cx - 44, 110, 88, 12);
          } else {
            // fallen log + cave mouth
            g.fillStyle(b.trunk, 1);
            g.fillRect(cx - 34, 172, 68, 16);
            g.fillStyle(0x000000, 0.45);
            blob(g, cx + 6, 178, 22);
          }
        });
      }
    });
  }

  /** Near foliage band: bushes, ferns, grass, flowers, mushrooms, crystals. */
  private foliageKey() {
    const b = this.biome;
    return this.tex("foliage", 170, (g, rnd) => {
      // bush mass
      g.fillStyle(b.near, 1);
      for (let x = -20; x < TW + 40; x += 34) blob(g, x + rnd() * 10, 132 + rnd() * 14, 30 + rnd() * 14);
      g.fillRect(0, 140, TW, 30);
      // highlights
      g.fillStyle(b.nearLight, 1);
      for (let x = -10; x < TW + 20; x += 30) g.fillRect(x, 112 + Math.round(rnd() * 12), 18, 6);
      // grass blades
      for (let x = 0; x < TW; x += 7) {
        g.fillStyle(rnd() > 0.5 ? b.nearLight : b.near, 1);
        const hh = 10 + rnd() * 18;
        g.fillRect(x, 140 - hh, 3, hh);
      }
      // ferns
      g.fillStyle(b.nearLight, 0.9);
      for (let i = 0; i < 14; i++) {
        const fx = rnd() * TW;
        for (let k = 0; k < 5; k++) g.fillRect(fx - 12 + k * 6, 138 - k * 6, 10, 3);
      }
      // flowers / mushrooms / crystals
      for (let i = 0; i < 22; i++) {
        const fx = rnd() * TW;
        const fy = 128 + rnd() * 16;
        const which = rnd();
        if (which < 0.4) {
          g.fillStyle(b.accent, 1);
          g.fillRect(fx, fy - 14, 5, 5);
          g.fillStyle(b.nearLight, 1);
          g.fillRect(fx + 1, fy - 9, 2, 9);
        } else if (which < 0.72) {
          g.fillStyle(b.accent2, 1);
          g.fillRect(fx - 5, fy - 10, 12, 6);
          g.fillStyle(0xf2eee6, 1);
          g.fillRect(fx - 2, fy - 4, 5, 6);
        } else {
          g.fillStyle(b.accent2, 0.9);
          g.fillRect(fx, fy - 16, 5, 16);
          g.fillRect(fx - 3, fy - 8, 11, 6);
        }
      }
    });
  }

  private mistKey() {
    return this.tex("mist", 160, (g, rnd) => {
      for (let i = 0; i < 16; i++) {
        g.fillStyle(this.biome.mist, 0.035 + rnd() * 0.035);
        const y = 30 + rnd() * 100;
        const r = 26 + rnd() * 22;
        const cx = rnd() * TW;
        tiled(cx, (px) => {
          for (let k = -3; k <= 3; k++) blob(g, px + k * r * 0.85, y + Math.abs(k) * 4, r * (1 - Math.abs(k) * 0.15));
        });
      }
    });
  }

  /** In-front-of-player wisp layer: soft leaves / dust silhouettes. */
  private fgKey() {
    return this.tex("fg", 140, (g, rnd) => {
      for (let i = 0; i < 26; i++) {
        g.fillStyle(this.biome.nearLight, 0.35 + rnd() * 0.25);
        const s = 3 + Math.round(rnd() * 4);
        g.fillRect(rnd() * TW, rnd() * 140, s, s);
      }
    });
  }

  // ---------- scene objects ----------

  private build() {
    const s = this.scene;
    const b = this.biome;
    const gy = this.groundY;

    this.sky = s.add.image(0, 0, this.skyKey()).setOrigin(0, 0).setDepth(-4);
    this.stars = s.add.tileSprite(0, 0, TW, TW, this.starsKey()).setOrigin(0, 0).setDepth(-3).setAlpha(0.9);
    s.tweens.add({ targets: this.stars, alpha: 0.55, duration: 2400, yoyo: true, repeat: -1 });

    this.clouds = s.add
      .tileSprite(0, 0, TW, 200, this.cloudsKey())
      .setOrigin(0, 0)
      .setDepth(-2)
      .setAlpha(0.55);

    // Moon sits in front of the cloud band so it stays clean and bright.
    this.moonGlow = s.add.circle(0, 0, 96, b.moon, 0.14).setDepth(-1);
    this.moonGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.moon = s.add.circle(0, 0, 50, b.moon, 1).setDepth(-1);
    s.tweens.add({ targets: this.moonGlow, scale: 1.15, alpha: 0.22, duration: 3200, yoyo: true, repeat: -1 });

    this.ridge = s.add
      .tileSprite(0, 0, TW, 260, this.ridgeKey())
      .setOrigin(0, 1)
      .setDepth(1)
      .setAlpha(0.5);

    this.treesFar = s.add
      .tileSprite(0, 0, TW, 260, this.treeBand("treesFar", 260, b.far, 6, 0.9))
      .setOrigin(0, 1)
      .setDepth(1)
      .setAlpha(0.62);

    this.treesMid = s.add
      .tileSprite(0, 0, TW, 300, this.treeBand("treesMid", 300, shade(b.mid, 0.08), 5, 1.05))
      .setOrigin(0, 1)
      .setDepth(2);

    this.props = s.add
      .tileSprite(0, 0, TW, 200, this.propsKey())
      .setOrigin(0, 1)
      .setDepth(2);

    this.mist = s.add
      .tileSprite(0, 0, TW, 160, this.mistKey())
      .setOrigin(0, 1)
      .setDepth(2)
      .setAlpha(0.7);

    this.foliage = s.add
      .tileSprite(0, 0, TW, 170, this.foliageKey())
      .setOrigin(0, 1)
      .setDepth(2);

    this.fg = s.add
      .tileSprite(0, 0, TW, 140, this.fgKey())
      .setOrigin(0, 1)
      .setDepth(7)
      .setAlpha(0.22);

    // Fireflies / sparkles: a small pool of glowing motes drifting near the path.
    const rnd = rng(99);
    for (let i = 0; i < 14; i++) {
      const mote = s.add.circle(0, 0, 3, i % 3 === 0 ? b.accent : b.accent2, 0.9).setDepth(6);
      mote.setData("ox", rnd());
      mote.setData("oy", gy - 60 - rnd() * 220);
      s.tweens.add({
        targets: mote,
        alpha: 0.15,
        scale: 1.8,
        duration: 900 + rnd() * 1400,
        yoyo: true,
        repeat: -1,
        delay: rnd() * 1200,
      });
      this.motes.push(mote);
    }
  }

  /**
   * Pins every layer to (and covers) the camera viewport. Sizes only change when
   * the view changes; positions and parallax offsets update each frame.
   */
  layout() {
    const cam = this.scene.cameras.main;
    const view = cam.worldView;
    if (!view.width) return;
    const bleed = 8;
    const w = Math.ceil(view.width) + bleed * 2;
    const h = Math.ceil(view.height) + bleed * 2;
    const x = Math.floor(view.x) - bleed;
    const y = Math.floor(view.y) - bleed;

    if (!this.size || this.size.w !== w || this.size.h !== h) {
      this.size = { w, h };
      this.sky.setDisplaySize(w, h);
      this.stars.setSize(w, Math.min(h, 460));
      this.clouds.setSize(w, 200);
      this.ridge.setSize(w, 260);
      this.treesFar.setSize(w, 260);
      this.treesMid.setSize(w, 300);
      this.props.setSize(w, 200);
      this.mist.setSize(w, 160);
      this.foliage.setSize(w, 170);
      this.fg.setSize(w, Math.min(h, 300));
    }

    const sx = cam.scrollX;
    const gy = this.groundY;

    this.sky.setPosition(x, y);
    this.stars.setPosition(x, y);
    this.stars.tilePositionX = sx * 0.04;
    this.moonGlow.setPosition(x + w * 0.76, y + h * 0.2);
    this.moon.setPosition(x + w * 0.76, y + h * 0.2);
    this.clouds.setPosition(x, y + h * 0.05);
    this.clouds.tilePositionX = sx * 0.08 + this.scene.time.now * 0.004;

    this.ridge.setPosition(x, gy + 30);
    this.ridge.tilePositionX = sx * 0.86 + x * 0.14;

    this.treesFar.setPosition(x, gy + 46);
    this.treesFar.tilePositionX = sx * 0.72 + x * 0.28;

    this.treesMid.setPosition(x, gy + 64);
    this.treesMid.tilePositionX = sx * 0.5 + x * 0.5;

    this.props.setPosition(x, gy + 40);
    this.props.tilePositionX = sx * 0.34 + x * 0.66;

    this.mist.setPosition(x, gy + 20);
    this.mist.tilePositionX = sx * 0.26 + x * 0.74 + this.scene.time.now * 0.006;

    this.foliage.setPosition(x, gy + 24);
    this.foliage.tilePositionX = sx * 0.14 + x * 0.86;

    // Foreground haze hugs the lower half so it never veils the sky or moon.
    this.fg.setPosition(x, gy + 40);
    this.fg.tilePositionX = sx * 1.12 + this.scene.time.now * 0.01;
    this.fg.tilePositionY = Math.sin(this.scene.time.now * 0.0004) * 20;

    // Fireflies float within the current view, drifting slowly sideways.
    const t = this.scene.time.now * 0.00012;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i]!;
      const ox = m.getData("ox") as number;
      const oy = m.getData("oy") as number;
      const px = ((ox + t * (0.4 + ox)) % 1) * w;
      this.motes[i]!.setPosition(x + px, oy + Math.sin(this.scene.time.now * 0.001 + i) * 14);
    }
  }
}
