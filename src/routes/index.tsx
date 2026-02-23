import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";

import type { Racer } from "~/lib/types";
import { getPlayerStats } from "~/lib/stats";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { RaceTrack } from "~/components/race-track";
import { StatsBar } from "~/components/stats-bar";
import { TypingArea } from "~/components/typing-area";
import { ResultsOverlay } from "~/components/results-overlay";
import { useSoloGame } from "~/hooks/use-solo-game";
import { useLocalTyping } from "~/hooks/use-local-typing";

export const Route = createFileRoute("/")({
  component: TypingTestPage,
});

/**
 * Solo typing test page — the thin orchestrator.
 *
 * Wires two hooks (`useSoloGame` for lifecycle, `useLocalTyping` for input)
 * to four pure components (`StatsBar`, `RaceTrack`, `TypingArea`, `ResultsOverlay`).
 * Stats are computed via `getPlayerStats()` on every render — no derived state.
 *
 * The local player is represented as a single-element `Racer[]` array so the
 * `RaceTrack` renders identically to how it would with multiple players.
 */
function TypingTestPage() {
  const { passage, gameStatus, timeLeft, start, restart } = useSoloGame();
  const { typed, totalKeystrokes, errors, handleChange, handleKeyDown, reset } = useLocalTyping(
    passage,
    gameStatus,
    { onStart: start },
  );

  const elapsed = gameStatus === "idle" ? 0 : 30 - timeLeft || 0.1;
  const stats = getPlayerStats(typed, passage, totalKeystrokes, errors, elapsed);

  const racers: Racer[] = [
    {
      id: "local",
      name: "You",
      progress: stats.progress,
      color: "red",
      finished: gameStatus === "finished",
    },
  ];

  const handleRestart = () => {
    restart();
    reset();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">hyper-typer</h1>
        <p className="text-sm text-muted-foreground">
          {gameStatus === "idle"
            ? "Start typing to begin the race"
            : gameStatus === "running"
              ? "Type fast, type accurate!"
              : "Race complete!"}
        </p>
      </div>

      <StatsBar
        timeLeft={timeLeft}
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        gameStatus={gameStatus}
      />

      <Card className="w-full max-w-3xl shadow-lg relative">
        <CardContent className="space-y-6 pt-6">
          <RaceTrack racers={racers} gameStatus={gameStatus} />

          <TypingArea
            passage={passage}
            typed={typed}
            gameStatus={gameStatus}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </CardContent>

        {gameStatus === "finished" && (
          <ResultsOverlay
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            progress={stats.progress}
            onRestart={handleRestart}
          />
        )}
      </Card>

      {gameStatus === "running" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRestart}
          className="gap-2 text-muted-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Restart
        </Button>
      )}
    </main>
  );
}
