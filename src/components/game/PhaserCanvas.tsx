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
    let observer: ResizeObserver | undefined;
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
        render: {
          antialias: false,
          roundPixels: true,
          powerPreference: "high-performance",
        },
        scale: {
          // NONE: we size the canvas ourselves from the container box (the stage
          // can be CSS-rotated), so the view fills the screen 1:1 — never stretched.
          mode: PhaserLib.Scale.NONE,
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

      // The stage can be CSS-rotated, so trust its layout box rather than the
      // browser orientation. Resize the renderer and camera together at the
      // exact container ratio; CSS never scales the canvas afterward.
      let queued = 0;
      const fit = () => {
        const el = holder.current;
        if (!el) return;
        const w = Math.max(1, Math.round(el.clientWidth));
        const h = Math.max(1, Math.round(el.clientHeight));
        if (game.scale.width !== w || game.scale.height !== h) {
          game.scale.resize(w, h);
        }
      };
      // Coalesce bursts of resize events (rotation, keyboard, browser chrome)
      // into a single fit per animation frame.
      const scheduleFit = () => {
        if (queued) return;
        queued = requestAnimationFrame(() => {
          queued = 0;
          fit();
        });
      };
      scheduleFit();
      observer = new ResizeObserver(scheduleFit);
      observer.observe(holder.current);

    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
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

  return <div ref={holder} className="absolute inset-0 overflow-hidden [&>canvas]:block" />;
}
