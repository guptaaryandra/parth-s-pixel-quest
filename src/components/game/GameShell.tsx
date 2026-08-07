import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  LayoutGrid,
  Pause,
  Play,
  RotateCcw,
  Settings2,
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
import {
  DEFAULT_LAYOUT,
  loadLayout,
  resetLayout,
  saveLayout,
  type ControlsLayout,
} from "@/game/settings";
import { fallbackRotation, keepLandscape, lockLandscape, requestFullscreen } from "@/game/orientation";
import { Hud } from "./Hud";
import { MenuBackdrop } from "./MenuBackdrop";
import { Overlay } from "./Overlay";
import { LevelSelect } from "./LevelSelect";
import { Settings } from "./Settings";
import { Shop } from "./Shop";
import { TouchPad } from "./TouchPad";

/** Tracks viewport orientation so we can rotate our own layout if the OS won't. */
function useViewport() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const read = () => {
      const vv = window.visualViewport;
      setSize({
        w: Math.round(vv?.width ?? window.innerWidth),
        h: Math.round(vv?.height ?? window.innerHeight),
      });
    };
    // Some devices report stale sizes right after a rotation event.
    const update = () => {
      read();
      window.setTimeout(read, 120);
      window.setTimeout(read, 400);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);
  return size;
}


export function GameShell() {
  const [status, setStatus] = useState<GameStatus>("start");
  const [settingsReturn, setSettingsReturn] = useState<GameStatus>("start");
  const [restartKey, setRestartKey] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [crystals, setCrystals] = useState(0);
  const [runCoins, setRunCoins] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(5);
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(0);
  const [best, setBest] = useState<Record<number, number>>({});
  const [shop, setShop] = useState<ShopState>({ coins: 0, owned: ["default"], outfit: "default" });
  const [shielded, setShielded] = useState(false);
  const [layout, setLayout] = useState<ControlsLayout>(DEFAULT_LAYOUT);
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
    setLayout(loadLayout());
  }, []);

  /** Landscape is the only supported orientation — keep asking for it. */
  useEffect(() => {
    void lockLandscape();
    return keepLandscape(() => frameRef.current);
  }, []);

  /** Full screen + landscape lock on the first user gesture. */
  const enterFullscreen = () => {
    void (async () => {
      await requestFullscreen(frameRef.current);
      await lockLandscape();
    })();
  };


  const onState = useCallback((patch: StatePatch) => {
    setScore(patch.score);
    setLives(patch.lives);
    setMaxLives(patch.maxLives);
    setCrystals(patch.crystals);
    setRunCoins(patch.runCoins);
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
    setRunCoins(0);
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

  const openSettings = () => {
    sfx.click();
    controls.left = controls.right = controls.jump = false;
    const from = status === "playing" ? "paused" : status;
    setSettingsReturn(from);
    setStatus("settings");
  };

  const closeSettings = () => {
    sfx.click();
    setStatus(settingsReturn);
  };

  /** Live preview + autosave of the control layout. */
  const updateLayout = (next: ControlsLayout) => setLayout(saveLayout(next));

  const resetControls = () => {
    sfx.click();
    setLayout(resetLayout());
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

  const view = useViewport();
  const running = status === "playing" || status === "paused";
  const inGame = running || status === "levelclear" || status === "gameover" || status === "victory";
  const level = getLevel(levelIndex);

  /**
   * The OS lock is not always available (browsers without Auto-Rotate, iOS).
   * In that case we rotate the whole stage ourselves so the game is still
   * played sideways — the player never has to touch Auto-Rotate.
   */
  const portrait = view.w > 0 && view.h > view.w;
  const stageW = portrait ? view.h : view.w;
  const stageH = portrait ? view.w : view.h;
  // Fill the whole screen; the canvas adapts its view instead of stretching.
  const boxW = stageW;
  const boxH = stageH;

  return (
    <div
      ref={frameRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-background"
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: stageW,
          height: stageH,
          transform: portrait ? `rotate(${fallbackRotation()}deg)` : undefined,
        }}
      >
      <div className="relative" style={{ width: boxW, height: boxH }}>

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
          <MenuBackdrop levelIndex={unlocked} />
        )}

        {/* Safe-area layer: UI anchors to the usable screen edges (notches,
            punch-holes, rounded corners, gesture bars) without scaling. */}
        <div
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingRight: "env(safe-area-inset-right)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
          }}
        >
          <div className="relative h-full w-full">
        {running && (
          <>
            <Hud
              score={score}
              lives={lives}
              maxLives={maxLives}
              crystals={crystals}
              totalCrystals={totalCrystals}
              level={levelIndex + 1}
              totalLevels={TOTAL_LEVELS}
              levelName={level.name}
              runCoins={runCoins}
              shielded={shielded}
            />
            <TouchPad layout={layout} />
          </>
        )}

        <div
          className={`pointer-events-auto absolute right-3 top-3 z-40 flex gap-2 ${
            status === "settings" || status === "shop" ? "hidden" : ""
          }`}
        >

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
          {status !== "shop" && !running && (
            <button
              type="button"
              onPointerUp={openShop}
              aria-label="Open shop"
              className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
            >
              <ShoppingBag size={18} />
            </button>
          )}
          {status !== "settings" && (
            <button
              type="button"
              onPointerUp={openSettings}
              aria-label="Controls settings"
              className="touch-manipulation rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
            >
              <Settings2 size={18} />
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
          </div>
        </div>

        {status === "levelselect" && (
          <LevelSelect
            unlocked={unlocked}
            best={best}
            onSelect={selectLevel}
            onBack={goHome}
          />
        )}

        {status === "shop" && (
          <Shop state={shop} onBuy={purchase} onEquip={equip} onBack={goHome} />
        )}

        {status === "settings" && (
          <Settings
            layout={layout}
            onChange={updateLayout}
            onReset={resetControls}
            onBack={goHome}
          />
        )}

        <Overlay
          status={status}
          score={score}
          level={levelIndex + 1}
          totalLevels={TOTAL_LEVELS}
          levelName={level.name}
          levelTagline={level.tagline}
          nextLevelName={getLevel(levelIndex + 1).name}
          wallet={shop.coins}
          onPlay={openLevelSelect}
          onShop={openShop}
          onResume={togglePause}
          onNextLevel={nextLevel}
          onRetryLevel={retryLevel}
          onGoHome={goHome}
        />

      </div>
      </div>
    </div>
  );
}

