import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parth's Anime Quest - Pixel Art Browser Platformer" },
      {
        name: "description",
        content:
          "Play Parth's Anime Quest, a free pixel art platformer: collect coins and blue crystals, dodge cute shadow monsters, on desktop or mobile.",
      },
      { property: "og:title", content: "Parth's Anime Quest - Pixel Art Browser Platformer" },
      {
        property: "og:description",
        content:
          "A cozy anime-inspired pixel platformer. Collect crystals, dodge shadow monsters, and beat your high score.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <header className="text-center">
        <p className="font-pixel text-[10px] uppercase tracking-[0.3em] text-crystal">
          Twilight Valley
        </p>
        <h1 className="mt-3 font-pixel text-base text-foreground sm:text-2xl">
          Parth&apos;s <span className="text-gold">Anime Quest</span>
        </h1>
      </header>
      <GameShell />
    </main>
  );
}
