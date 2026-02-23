import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { RotateCcw, Users } from "lucide-react";

import { api } from "../../convex/_generated/api";
import type { Racer } from "~/lib/types";
import { getPlayerStats } from "~/lib/stats";
import { pickRandom } from "~/lib/passages";
import { getGuestId } from "~/lib/guest";

import { Button } from "~/components/ui/button";
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
 * Solo typing test page. Also serves as the entry point for creating
 * multiplayer rooms via the "Create Room" button.
 */
function TypingTestPage() {
  const { passage, gameStatus, timeLeft, start, restart } = useSoloGame();
  const { typed, totalKeystrokes, errors, handleChange, handleKeyDown, reset } = useLocalTyping(
    passage,
    gameStatus,
    { onStart: start },
  );
  const createRoom = useMutation(api.games.create);
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const hostId = getGuestId();
      const roomPassage = pickRandom();
      const roomId = await createRoom({ hostId, passage: roomPassage });
      navigate({ to: "/room/$roomId", params: { roomId } });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="h-dvh flex flex-col items-center justify-center p-8 max-w-5xl mx-auto gap-12 overflow-hidden">
      <div className="w-full flex justify-between items-center opacity-50 mb-8 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-primary">hyper-typer</h1>
        <div className="flex items-center gap-3">
          {gameStatus === "running" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          )}

          {gameStatus === "idle" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              {isCreating ? "Creating..." : "Multiplayer"}
            </Button>
          )}
        </div>
      </div>

      {gameStatus === "finished" ? (
        <div className="w-full flex-1 flex items-center justify-center relative min-h-0">
          <ResultsOverlay
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            progress={stats.progress}
            onRestart={handleRestart}
          />
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 gap-12">
          <StatsBar
            timeLeft={timeLeft}
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            gameStatus={gameStatus}
          />

          <div className="w-full space-y-12 relative flex-1 flex flex-col min-h-0">
            <RaceTrack racers={racers} gameStatus={gameStatus} />

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
              <TypingArea
                passage={passage}
                typed={typed}
                gameStatus={gameStatus}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
