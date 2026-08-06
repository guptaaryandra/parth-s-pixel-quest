import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { gameBus, type StatePatch } from "@/game/state";

type Props = {
  paused: boolean;
  restartKey: number;
  level: number;
  startScore: number;
  startLives: number;
  onState: (patch: StatePatch) => void;
};

export function PhaserCanvas({ paused, restartKey, level, startScore, startLives, onState }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const boot = useRef({ level, startScore, startLives });
  boot.current = { level, startScore, startLives };

  useEffect(() => {
    let cancelled = false;
    const handler = (patch: StatePatch) => onState(patch);
    gameBus.on("state", handler);

    void (async () => {
      const [{ default: PhaserLib }, { GameScene, GAME_SIZE }] = await Promise.all([
        import("phaser"),
        import("@/game/GameScene"),
      ]);
      if (cancelled || !holder.current) return;
      const game = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        parent: holder.current,
        backgroundColor: "#151129",
        width: GAME_SIZE.width,
        height: GAME_SIZE.height,
        pixelArt: true,
        scale: {
          // RESIZE: the canvas matches the container exactly, so the view fills
          // the screen edge-to-edge without ever stretching the pixel art.
          mode: PhaserLib.Scale.RESIZE,
          autoCenter: PhaserLib.Scale.NO_CENTER,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 1500 } },
        },
      });
      gameRef.current = game;
      game.scene.add("game", GameScene, true, {
        level: boot.current.level,
        score: boot.current.startScore,
        lives: boot.current.startLives,
      });
    })();

    return () => {
      cancelled = true;
      gameBus.off("state", handler);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [restartKey, onState]);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene("game");
    if (!scene) return;
    if (paused) scene.scene.pause();
    else scene.scene.resume();
  }, [paused]);

  return <div ref={holder} className="h-full w-full" />;
}
