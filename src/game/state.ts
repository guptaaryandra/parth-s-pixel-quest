export type Controls = { left: boolean; right: boolean; jump: boolean };

export const controls: Controls = { left: false, right: false, jump: false };

export type GameStatus =
  | "start"
  | "levelselect"
  | "shop"
  | "settings"
  | "playing"
  | "paused"
  | "levelclear"
  | "gameover"
  | "victory";

export type StatePatch = {
  score: number;
  lives: number;
  maxLives: number;
  crystals: number;
  totalCrystals: number;
  level: number;
  totalLevels: number;
  /** Coins banked in the shop wallet. */
  wallet: number;
  /** Coins collected in the current run (resets when Parth dies). */
  runCoins: number;
  shielded: boolean;
  status?: "levelclear" | "gameover" | "victory";
};


type Listener = (payload: any) => void;

/** Framework-free emitter so the UI layer never imports Phaser during SSR. */
class Bus {
  private listeners = new Set<Listener>();
  on(_event: "state", fn: Listener) {
    this.listeners.add(fn);
  }
  off(_event: "state", fn: Listener) {
    this.listeners.delete(fn);
  }
  emit(_event: "state", payload: unknown) {
    for (const fn of this.listeners) fn(payload);
  }
}

export const gameBus = new Bus();
