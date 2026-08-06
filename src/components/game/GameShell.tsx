import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  LayoutGrid,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";

import { PhaserCanvas } from "./PhaserCanvas";
import { controls, type GameStatus, type StatePatch } from "@/game/state";
import { getLevel, TOTAL_LEVELS } from "@/game/levels";
import { sfx } from "@/game/audio";
import { completeLevel, loadProgress } from "@/game/progress";
import {
  buyItem,
  equipOutfit,
  hasPower,
  loadShop,
  type ShopState,
} from "@/game/shop";
import { Hud } from "./Hud";
import { Overlay } from "./Overlay";
import { LevelSelect } from "./LevelSelect";
import { Shop } from "./Shop";
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
  const [maxLives, setMaxLives] = useState(3);
  const [crystals, setCrystals] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(5);
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(0);
  const [best, setBest] = useState<Record<number, number>>({});
  const [shop, setShop] = useState<ShopState>({ coins: 0, owned: ["default"], outfit: "default" });
  const [shielded, setShielded] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef(0);
  levelRef.current = levelIndex;

  useEffect(() => {
    setMuted(sfx.loadMuted());
    const p = loadProgress();
    setUnlocked(Math.min(p.unlocked, TOTAL_LEVELS - 1));
    setBest(p.best);
    const s = loadShop();
    setShop(s);
    const startLives = 3 + (hasPower(s, "extra-heart") ? 1 : 0);
    setMaxLives(startLives);
    setLives(startLives);
  }, []);


  /** Full screen is the default experience — request it on the first user gesture. */
  const enterFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        void frameRef.current?.requestFullscreen?.().catch(() => undefined);
      }
      const orientation = screen.orientation as
        | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
        | undefined;
      void orientation?.lock?.("landscape").catch(() => undefined);
    } catch {
      /* fullscreen unavailable */
    }
  };

  const onState = useCallback((patch: StatePatch) => {
    setScore(patch.score);
    setLives(patch.lives);
    setMaxLives(patch.maxLives);
    setCrystals(patch.crystals);
    setTotalCrystals(patch.totalCrystals);
    setShielded(patch.shielded);
    setShop((s) => (s.coins === patch.wallet ? s : { ...s, coins: patch.wallet }));
    if (patch.status) {
      setStatus(patch.status);
      if (patch.status === "levelclear" || patch.status === "victory") {
        const p = completeLevel(levelRef.current, patch.score);
        setUnlocked(Math.min(p.unlocked, TOTAL_LEVELS - 1));
        setBest(p.best);
      }
    }
  }, []);

  const launch = (index: number, carryScore: number, carryLives: number) => {
    controls.left = controls.right = controls.jump = false;
    sfx.unlock();
    enterFullscreen();
    setLevelIndex(index);
    levelRef.current = index;
    setScore(carryScore);
    setLives(carryLives);
    setCrystals(0);
    setRestartKey((k) => k + 1);
    setStatus("playing");
  };

  const freshLives = () => 3 + (hasPower(loadShop(), "extra-heart") ? 1 : 0);

  const openLevelSelect = () => {
    sfx.click();
    sfx.unlock();
    enterFullscreen();
    controls.left = controls.right = controls.jump = false;
    setStatus("levelselect");
  };

  const openShop = () => {
    sfx.click();
    sfx.unlock();
    controls.left = controls.right = controls.jump = false;
    setShop(loadShop());
    setStatus("shop");
  };

  const purchase = (id: string, price: number) => {
    sfx.crystal();
    setShop(buyItem(id, price));
  };

  const equip = (id: string) => {
    sfx.click();
    setShop(equipOutfit(id));
  };

  const selectLevel = (index: number) => {
    sfx.click();
    launch(index, 0, freshLives());
  };

  const nextLevel = () => {
    sfx.click();
    launch(Math.min(levelIndex + 1, TOTAL_LEVELS - 1), score, lives);
  };

  const retryLevel = () => {
    sfx.click();
    launch(levelIndex, score, freshLives());
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
        if (status === "start" || status === "gameover" || status === "victory") openLevelSelect();
        else if (status === "levelclear") nextLevel();
      }
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const portrait = useIsPortrait();
  const running = status === "playing" || status === "paused";
  const inGame = running || status === "levelclear" || status === "gameover" || status === "victory";
  const level = getLevel(levelIndex);

  return (
    <div
      ref={frameRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-background"
    >
      <div className="relative aspect-video max-h-screen w-full max-w-[calc(100vh*16/9)]">
        {inGame ? (
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

        <div className="pointer-events-auto absolute right-3 top-3 z-40 flex gap-2">
          {status !== "start" && (
            <button
              type="button"
              onPointerUp={goHome}
              aria-label="Go to home screen"
              className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
            >
              <Home size={18} />
            </button>
          )}
          {status !== "levelselect" && (
            <button
              type="button"
              onPointerUp={openLevelSelect}
              aria-label="Select level"
              className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
            >
              <LayoutGrid size={18} />
            </button>
          )}
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

        {status === "levelselect" && (
          <LevelSelect
            unlocked={unlocked}
            best={best}
            onSelect={selectLevel}
            onBack={goHome}
          />
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
          onPlay={openLevelSelect}
          onResume={togglePause}
          onNextLevel={nextLevel}
          onRetryLevel={retryLevel}
          onGoHome={goHome}
        />
      </div>
    </div>
  );
}
