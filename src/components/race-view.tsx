import type { Id } from "../../convex/_generated/dataModel";
import type { GameStatus, Racer, RacerColor } from "~/lib/types";
import { getPlayerStats, getRemotePlayerStats, getForwardProgress } from "~/lib/stats";
import { calculateElapsedSeconds } from "~/lib/time";
import { MIN_ELAPSED_SECONDS } from "~/lib/constants";

import { RaceTrack } from "~/components/race-track";
import { StatsBar } from "~/components/stats-bar";
import { TypingArea } from "~/components/typing-area";
import { MultiplayerResults } from "~/components/multiplayer-results";
import { useLocalTyping } from "~/hooks/use-local-typing";
import { useProgressSync } from "~/hooks/use-progress-sync";

interface PlayerDoc {
  guestId: string;
  name: string;
  color: string;
  typedLength: number;
  totalKeystrokes: number;
  errors: number;
  finished: boolean;
  finishedAt?: number;
  vote?: "replay" | "exit";
}

interface VoteSummaryEntry {
  name: string;
  color: string;
  vote: "replay" | "exit" | undefined;
}

export function RaceView({
  game,
  gameId,
  guestId,
  myPlayer,
  players,
  remotePlayers,
  passage,
  elapsedTime,
  myVote,
  voteSummary,
  onReplay,
  onLeave,
}: {
  game: { status: string; startedAt?: number; duration: number };
  gameId: Id<"games">;
  guestId: string;
  myPlayer: PlayerDoc;
  players: PlayerDoc[];
  remotePlayers: Racer[];
  passage: string;
  elapsedTime: number;
  myVote: "replay" | "exit" | undefined;
  voteSummary: VoteSummaryEntry[];
  onReplay: () => void;
  onLeave: () => void;
}) {
  const isLocallyFinished = myPlayer.finished;
  const showPersonalResults = isLocallyFinished && game.status === "running";
  const showFinalResults = game.status === "finished";

  const gameStatus: GameStatus = showFinalResults ? "finished" : "running";
  const effectiveStatus: GameStatus = showPersonalResults ? "finished" : gameStatus;

  const { typed, totalKeystrokes, errors, handleChange, handleKeyDown } = useLocalTyping(
    passage,
    effectiveStatus,
  );

  useProgressSync(
    gameId,
    guestId,
    passage.length,
    {
      typedLength: typed.length,
      totalKeystrokes,
      errors,
    },
    effectiveStatus,
  );

  const elapsedForLocal =
    isLocallyFinished && myPlayer.finishedAt && game.startedAt
      ? calculateElapsedSeconds(game.startedAt, myPlayer.finishedAt)
      : elapsedTime;
  const elapsed = elapsedForLocal || MIN_ELAPSED_SECONDS;

  const stats = getPlayerStats(typed, passage, totalKeystrokes, errors, elapsed);

  const isFinished = typed.length >= passage.length;

  const localRacer: Racer = {
    id: myPlayer.guestId,
    name: myPlayer.name,
    progress: getForwardProgress(totalKeystrokes, errors, passage.length, isFinished),
    color: myPlayer.color as RacerColor,
    finished: isLocallyFinished,
  };

  const racers = [localRacer, ...remotePlayers];

  const rankings =
    effectiveStatus === "finished"
      ? players
          .map((p) => {
            if (p.guestId === myPlayer.guestId) {
              return {
                name: p.name,
                color: p.color as RacerColor,
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                progress: stats.progress,
                finished: isFinished,
              };
            }
            const playerElapsed =
              p.finished && p.finishedAt && game.startedAt
                ? calculateElapsedSeconds(game.startedAt, p.finishedAt)
                : elapsed;
            const remoteStats = getRemotePlayerStats(
              p.typedLength,
              passage.length,
              p.totalKeystrokes,
              p.errors,
              playerElapsed,
            );
            return {
              name: p.name,
              color: p.color as RacerColor,
              wpm: remoteStats.wpm,
              accuracy: remoteStats.accuracy,
              progress: remoteStats.progress,
              finished: p.finished,
            };
          })
          .sort((a, b) => b.progress - a.progress)
      : [];

  const waitingCount = players.filter((p) => !p.finished).length;

  return (
    <main className="h-dvh flex flex-col items-center justify-center p-8 max-w-5xl mx-auto gap-12 overflow-hidden">
      <div className="w-full text-left opacity-50 mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-primary">hyper-typer</h1>
      </div>

      {effectiveStatus === "finished" ? (
        <div className="w-full flex-1 flex items-center justify-center relative min-h-0">
          <MultiplayerResults
            rankings={rankings}
            waitingForPlayers={showPersonalResults ? waitingCount : undefined}
            myVote={myVote}
            voteSummary={voteSummary}
            onReplay={onReplay}
            onLeave={onLeave}
          />
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 gap-12">
          <StatsBar
            elapsedTime={elapsedTime}
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
