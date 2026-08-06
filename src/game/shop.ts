/** Coin wallet + shop (outfits & power-ups), persisted locally so it works offline. */

import type { Palette } from "./pixels";

const KEY = "paq.shop.v1";

export type ShopState = {
  /** Coins banked from gameplay. */
  coins: number;
  /** Purchased item ids. */
  owned: string[];
  /** Equipped outfit id. */
  outfit: string;
};

export type Outfit = {
  id: string;
  name: string;
  desc: string;
  price: number;
  /** Hero palette overrides (coat, scarf, pants, hair). */
  colors: Palette;
};

export type Power = {
  id: string;
  name: string;
  desc: string;
  price: number;
};

export const OUTFITS: Outfit[] = [
  {
    id: "default",
    name: "Traveler",
    desc: "Parth's trusty teal coat.",
    price: 0,
    colors: {},
  },
  {
    id: "sakura",
    name: "Sakura Kimono",
    desc: "Petal-pink robe with a plum sash.",
    price: 120,
    colors: { c: "#ff9ec4", C: "#e0709f", r: "#ffe6f2", p: "#7b3f63", b: "#4a1f38" },
  },
  {
    id: "midnight",
    name: "Midnight Cloak",
    desc: "Shadow-woven cloak, silver trim.",
    price: 180,
    colors: { c: "#3b3670", C: "#26224d", r: "#9fb4ff", p: "#221f42", b: "#141227" },
  },
  {
    id: "ember",
    name: "Ember Armor",
    desc: "Molten plate from Ember Summit.",
    price: 260,
    colors: { c: "#ff7a3c", C: "#c14a1b", r: "#ffd166", p: "#5c2a19", b: "#33170e" },
  },
  {
    id: "frost",
    name: "Frost Dress",
    desc: "Glacier silk that never melts.",
    price: 320,
    colors: { c: "#a8e8ff", C: "#63bde0", r: "#ffffff", p: "#2f6a85", b: "#1b3f52" },
  },
  {
    id: "neon",
    name: "Neon Runner",
    desc: "Bazaar streetwear that hums.",
    price: 420,
    colors: { c: "#c8ff4d", C: "#7fc41c", r: "#ff4df0", p: "#232a1a", b: "#111507", h: "#20e0d0" },
  },
  {
    id: "celestial",
    name: "Celestial Gown",
    desc: "Stitched from starlight itself.",
    price: 600,
    colors: { c: "#f2e9ff", C: "#c0a8ff", r: "#ffd966", p: "#4a3a8c", b: "#241a4d", h: "#ffe9a8" },
  },
];

export const POWERS: Power[] = [
  { id: "extra-heart", name: "Extra Heart", desc: "Start every level with 4 lives.", price: 200 },
  { id: "swift-boots", name: "Swift Boots", desc: "Run noticeably faster.", price: 150 },
  { id: "double-jump", name: "Double Jump", desc: "One extra mid-air jump.", price: 300 },
  { id: "magnet", name: "Coin Magnet", desc: "Nearby coins fly to Parth.", price: 250 },
  { id: "shield", name: "Aura Shield", desc: "Absorbs the first hit each level.", price: 400 },
];

const empty: ShopState = { coins: 0, owned: ["default"], outfit: "default" };

export function loadShop(): ShopState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Partial<ShopState>;
    return {
      coins: Math.max(0, Number(p.coins ?? 0)),
      owned: Array.from(new Set(["default", ...(p.owned ?? [])])),
      outfit: p.outfit ?? "default",
    };
  } catch {
    return empty;
  }
}

export function saveShop(s: ShopState): ShopState {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
  }
  return s;
}

export function addCoins(amount: number): ShopState {
  const s = loadShop();
  return saveShop({ ...s, coins: s.coins + amount });
}

export function buyItem(id: string, price: number): ShopState {
  const s = loadShop();
  if (s.owned.includes(id) || s.coins < price) return s;
  return saveShop({ ...s, coins: s.coins - price, owned: [...s.owned, id] });
}

export function equipOutfit(id: string): ShopState {
  const s = loadShop();
  if (!s.owned.includes(id)) return s;
  return saveShop({ ...s, outfit: id });
}

export function outfitColors(id: string): Palette {
  return OUTFITS.find((o) => o.id === id)?.colors ?? {};
}

export function hasPower(s: ShopState, id: string) {
  return s.owned.includes(id);
}
