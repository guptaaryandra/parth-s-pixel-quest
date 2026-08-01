import Phaser from "phaser";

export type Controls = { left: boolean; right: boolean; jump: boolean };

export const controls: Controls = { left: false, right: false, jump: false };

export type GameStatus = "start" | "playing" | "paused" | "gameover" | "victory";

export type GameState = {
  score: number;
  lives: number;
  crystals: number;
  totalCrystals: number;
  status: GameStatus;
};

export const gameBus = new Phaser.Events.EventEmitter();
