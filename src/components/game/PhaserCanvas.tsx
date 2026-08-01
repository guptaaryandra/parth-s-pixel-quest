import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { gameBus } from "@/game/state";

type Props = {
  paused: boolean;
  restartKey: number;
  onState: (patch: {
    score: number;
    lives: number;
    crystals: number;
    totalCrystals: number;
    status?: "gameover" | "victory";
  }) => void;
};

export function PhaserCanvas({ paused, restartKey, onState }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handler = (patch: Parameters<Props["onState"]>[0]) => onState(patch);
    gameBus.on("state", handler);

    void (async () => {
      const [{ default: PhaserLib }, { GameScene, GAME_SIZE }] = await Promise.all([
        import("phaser"),
        import("@/game/GameScene"),
      ]);
      if (cancelled || !holder.current) return;
      gameRef.current = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        parent: holder.current,
        backgroundColor: "#151129",
        width: GAME_SIZE.width,
        height: GAME_SIZE.height,
        pixelArt: true,
        scale: {
          mode: PhaserLib.Scale.FIT,
          autoCenter: PhaserLib.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 1500 } },
        },
        scene: [GameScene],
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

  return <div ref={holder} className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full" />;
}
