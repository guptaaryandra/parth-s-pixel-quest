import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from "lucide-react";
import { PhaserCanvas } from "./PhaserCanvas";
import { controls, type GameStatus } from "@/game/state";
import { Hud } from "./Hud";
import { Overlay } from "./Overlay";
import { TouchPad } from "./TouchPad";

export function GameShell() {
  const [status, setStatus] = useState<GameStatus>("start");
  const [restartKey, setRestartKey] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [crystals, setCrystals] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(5);

  const onState = useCallback(
    (patch: {
      score: number;
      lives: number;
      crystals: number;
      totalCrystals: number;
      status?: "gameover" | "victory";
    }) => {
      setScore(patch.score);
      setLives(patch.lives);
      setCrystals(patch.crystals);
      setTotalCrystals(patch.totalCrystals);
      if (patch.status) setStatus(patch.status);
    },
    [],
  );

  const start = () => {
    controls.left = controls.right = controls.jump = false;
    setScore(0);
    setLives(3);
    setCrystals(0);
    setRestartKey((k) => k + 1);
    setStatus("playing");
  };

  const togglePause = () =>
    setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") togglePause();
      if (e.key === "Enter" && (status === "start" || status === "gameover" || status === "victory"))
        start();
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const running = status === "playing" || status === "paused";

  return (
    <div className="w-full max-w-5xl">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          {running ? (
            <PhaserCanvas paused={status === "paused"} restartKey={restartKey} onState={onState} />
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
              />
              <div className="pointer-events-auto absolute right-3 top-3 z-20 flex gap-2">
                <button
                  onClick={togglePause}
                  aria-label={status === "paused" ? "Resume" : "Pause"}
                  className="rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
                >
                  {status === "paused" ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={start}
                  aria-label="Restart"
                  className="rounded-xl border border-border bg-panel/80 p-2 text-foreground backdrop-blur transition hover:bg-accent"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              <TouchPad />
            </>
          )}

          <Overlay status={status} score={score} onPlay={start} onResume={togglePause} />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
        <ArrowLeft className="inline size-3.5" /> <ArrowRight className="inline size-3.5" /> move
        &nbsp;·&nbsp; <ArrowUp className="inline size-3.5" /> / Space jump &nbsp;·&nbsp; P pause
        &nbsp;·&nbsp; touch buttons on mobile
      </p>
    </div>
  );
}
