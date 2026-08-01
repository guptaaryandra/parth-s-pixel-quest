import React from "react";
import { createRoot } from "react-dom/client";
import "@/styles.css";
import "./font.css";
import { GameShell } from "@/components/game/GameShell";

function AndroidApp() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-2 py-2">
      <h1 className="sr-only">Parth&apos;s Anime Quest</h1>
      <GameShell />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AndroidApp />
  </React.StrictMode>,
);
