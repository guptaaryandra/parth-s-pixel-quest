import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Home,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

import { PhaserCanvas } from "./PhaserCanvas";
import { controls, type GameStatus, type StatePatch } from "@/game/state";
import { getLevel, TOTAL_LEVELS } from "@/game/levels";
import { sfx } from "@/game/audio";
import { Hud } from "./Hud";
import { Overlay } from "./Overlay";
import { TouchPad } from "./TouchPad";

function useIsPortrait() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return portrait;
}

export function GameShell() {
  const [status, setStatus] = useState<GameStatus>("start");
  const [restartKey, setRestartKey] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [crystals, setCrystals] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(5);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    sfx.click();
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await frameRef.current?.requestFullscreen?.();
        const orientation = screen.orientation as
          | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
          | undefined;
        await orientation?.lock?.("landscape").catch(() => undefined);
      }
    } catch {
      /* fullscreen unavailable */
    }
  };

  useEffect(() => {
    setMuted(sfx.loadMuted());
  }, []);

  const onState = useCallback((patch: StatePatch) => {
    setScore(patch.score);
    setLives(patch.lives);
    setCrystals(patch.crystals);
    setTotalCrystals(patch.totalCrystals);
    if (patch.status) setStatus(patch.status);
  }, []);

  const launch = (index: number, carryScore: number, carryLives: number) => {
    controls.left = controls.right = controls.jump = false;
    sfx.unlock();
    setLevelIndex(index);
    setScore(carryScore);
    setLives(carryLives);
    setCrystals(0);
    setRestartKey((k) => k + 1);
    setStatus("playing");
  };

  const start = () => {
    sfx.click();
    launch(0, 0, 3);
  };

  const nextLevel = () => {
    sfx.click();
    launch(Math.min(levelIndex + 1, TOTAL_LEVELS - 1), score, lives);
  };

  const retryLevel = () => {
    sfx.click();
    launch(levelIndex, score, 3);
  };

  const goHome = () => {
    sfx.click();
    controls.left = controls.right = controls.jump = false;
    setStatus("start");
  };

  const togglePause = () =>
    setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));


  const toggleMute = () => {
    const next = !muted;
    sfx.setMuted(next);
    setMuted(next);
    if (!next) sfx.click();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") togglePause();
      if (e.key === "m" || e.key === "M") toggleMute();
      if (e.key === "Enter") {
        if (status === "start" || status === "gameover" || status === "victory") start();
        else if (status === "levelclear") nextLevel();
      }
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const portrait = useIsPortrait();
  const running = status === "playing" || status === "paused";
  const level = getLevel(levelIndex);

  return (
    <div className="w-full max-w-6xl">
      <div
        ref={frameRef}
        className={
          fullscreen
            ? "relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background"
            : "relative overflow-hidden rounded-3xl border border-border bg-card shadow-glow"
        }
      >
        <div
          className={
            fullscreen
              ? "relative aspect-video max-h-screen w-full max-w-[calc(100vh*16/9)]"
              : "relative aspect-video w-full"
          }
        >
          {status !== "start" ? (
            <PhaserCanvas
              paused={status !== "playing"}
              restartKey={restartKey}
              level={levelIndex}
              startScore={score}
              startLives={lives}
              onState={onState}
            />
          ) : (
            <div className="h-full w-full bg-gradient-night" />
          )}

          {running && (
            <>
              <Hud
                score={score}
                lives={lives}
                crystals={crystals}
                totalCrystals={totalCrystals}
                level={levelIndex + 1}
                totalLevels={TOTAL_LEVELS}
                levelName={level.name}
              />
              <TouchPad />
            </>
          )}

          {(
            <div className="pointer-events-auto absolute right-3 top-3 z-40 flex gap-2">
              <button
                type="button"
                onPointerUp={() => void toggleFullscreen()}
                aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
                className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
              >
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                type="button"
                onPointerUp={toggleMute}
                aria-label={muted ? "Unmute sound" : "Mute sound"}
                className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              {running && (
                <>
                  <button
                    type="button"
                    onPointerUp={togglePause}
                    aria-label={status === "paused" ? "Resume" : "Pause"}
                    className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
                  >
                    {status === "paused" ? <Play size={18} /> : <Pause size={18} />}
                  </button>
                  <button
                    type="button"
                    onPointerUp={retryLevel}
                    aria-label="Restart level"
                    className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
                  >
                    <RotateCcw size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {portrait && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 p-6 text-center">
              <RotateCw className="size-10 animate-pulse text-crystal" />
              <p className="font-pixel text-[10px] leading-relaxed text-foreground sm:text-xs">
                Rotate your device
              </p>
              <p className="text-xs text-muted-foreground">
                Parth&apos;s Anime Quest plays in horizontal (16:9) mode only.
              </p>
            </div>
          )}

          <Overlay
            status={status}
            score={score}
            level={levelIndex + 1}
            totalLevels={TOTAL_LEVELS}
            levelName={level.name}
            levelTagline={level.tagline}
            nextLevelName={getLevel(levelIndex + 1).name}
            onPlay={start}
            onResume={togglePause}
            onNextLevel={nextLevel}
          />
        </div>
      </div>

      {!fullscreen && (
      <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
        <ArrowLeft className="inline size-3.5" /> <ArrowRight className="inline size-3.5" /> move
        &nbsp;·&nbsp; <ArrowUp className="inline size-3.5" /> / Space jump &nbsp;·&nbsp; P pause
        &nbsp;·&nbsp; M mute &nbsp;·&nbsp; touch buttons on mobile
      </p>
      )}
    </div>
  );
}
