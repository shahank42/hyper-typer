import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { GameStatus, Racer, RacerColor } from "~/lib/types";
import { getPlayerStats, getRemotePlayerStats, getForwardProgress } from "~/lib/stats";
import { pickRandom } from "~/lib/passages";

import { Card, CardContent } from "~/components/ui/card";
import { RaceTrack } from "~/components/race-track";
import { StatsBar } from "~/components/stats-bar";
import { TypingArea } from "~/components/typing-area";
import { Lobby } from "~/components/lobby";
import { JoinForm } from "~/components/join-form";
import { CountdownOverlay } from "~/components/countdown-overlay";
import { MultiplayerResults } from "~/components/multiplayer-results";
import { useGuestId } from "~/hooks/use-guest-id";
import { useMultiplayerGame } from "~/hooks/use-multiplayer-game";
import { useLocalTyping } from "~/hooks/use-local-typing";
import { useProgressSync } from "~/hooks/use-progress-sync";

export const Route = createFileRoute("/room/$roomId")({
  component: RoomPage,
});

/**
 * Multiplayer room page. Orchestrates all multiplayer phases based on `game.status`:
 * waiting (lobby/join), countdown, running, finished (results + voting).
 *
 * The URL is stable (`/room/<roomId>`). On replay, `currentGameId` swings
 * to a new game and the subscription auto-updates without navigation.
 * Redirects home if the room is deleted (e.g. all players leave).
 */
function RoomPage() {
  const { roomId } = Route.useParams();
  const guestId = useGuestId();
  const joinMutation = useMutation(api.games.join);
  const startMutation = useMutation(api.games.start);
  const voteReplayMutation = useMutation(api.games.voteReplay);
  const voteExitMutation = useMutation(api.games.voteExit);
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const typedRoomId = roomId as Id<"rooms">;

  const {
    game,
    gameId,
    players,
    passage,
    isHost,
    myPlayer,
    remotePlayers,
    timeLeft,
    countdownSeconds,
    myVote,
    voteSummary,
    isLoading,
  } = useMultiplayerGame(typedRoomId, guestId);

  const hadData = useRef(false);
  if (game) hadData.current = true;

  useEffect(() => {
    if (hadData.current && !isLoading && !game) {
      navigate({ to: "/" });
    }
  }, [isLoading, game, navigate]);

  if (!guestId || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!game || !gameId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Room not found.</p>
        <Link to="/" className="text-primary underline">
          Back to Home
        </Link>
      </main>
    );
  }

  if (!myPlayer && game.status !== "waiting") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This game has already started.</p>
        <Link to="/" className="text-primary underline">
          Back to Home
        </Link>
      </main>
    );
  }

  if (!myPlayer && game.status === "waiting") {
    const handleJoin = async (name: string) => {
      setIsJoining(true);
      try {
        await joinMutation({ roomId: typedRoomId, guestId, name });
      } finally {
        setIsJoining(false);
      }
    };

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">hyper-typer</h1>
          <p className="text-sm text-muted-foreground">Join this room!</p>
        </div>
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="pt-6">
            <JoinForm onJoin={handleJoin} isLoading={isJoining} />
          </CardContent>
        </Card>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (game.status === "waiting") {
    const handleStart = () => {
      startMutation({ roomId: typedRoomId, guestId });
    };

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">hyper-typer</h1>
          <p className="text-sm text-muted-foreground">Waiting for players...</p>
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <Lobby
              players={players.map((p) => ({ name: p.name, color: p.color }))}
              isHost={isHost}
              shareUrl={shareUrl}
              onStart={handleStart}
              canStart={players.length >= 1}
            />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (game.status === "countdown") {
    const allRacersAtZero: Racer[] = players.map((p) => ({
      id: p.guestId,
      name: p.name,
      progress: 0,
      color: p.color as RacerColor,
      finished: false,
    }));

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">hyper-typer</h1>
          <p className="text-sm text-muted-foreground">Get ready!</p>
        </div>
        <Card className="w-full max-w-3xl shadow-lg relative">
          <CardContent className="space-y-6 pt-6">
            <RaceTrack racers={allRacersAtZero} gameStatus="idle" />
          </CardContent>
          <CountdownOverlay seconds={countdownSeconds} />
        </Card>
      </main>
    );
  }

  const handleReplay = () => {
    const newPassage = pickRandom(passage);
    voteReplayMutation({ roomId: typedRoomId, guestId, passage: newPassage });
  };

  const handleLeave = () => {
    voteExitMutation({ roomId: typedRoomId, guestId });
    navigate({ to: "/" });
  };

  return (
    <RaceView
      game={game}
      gameId={gameId}
      guestId={guestId}
      myPlayer={myPlayer!}
      players={players}
      remotePlayers={remotePlayers}
      passage={passage}
      timeLeft={timeLeft}
      myVote={myVote}
      voteSummary={voteSummary}
      onReplay={handleReplay}
      onLeave={handleLeave}
    />
  );
}

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

/**
 * Active race view. Mounted only during running/finished phases so that
 * `useLocalTyping` sees "running" from the moment it mounts.
 */
function RaceView({
  game,
  gameId,
  guestId,
  myPlayer,
  players,
  remotePlayers,
  passage,
  timeLeft,
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
  timeLeft: number;
  myVote: "replay" | "exit" | undefined;
  voteSummary: VoteSummaryEntry[];
  onReplay: () => void;
  onLeave: () => void;
}) {
  const gameStatus: GameStatus = game.status === "running" ? "running" : "finished";

  const { typed, totalKeystrokes, errors, handleChange, handleKeyDown } = useLocalTyping(
    passage,
    gameStatus,
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
    gameStatus,
  );

  const elapsed = game.startedAt ? Math.max(0.1, (Date.now() - game.startedAt) / 1000) : 0.1;

  const stats = getPlayerStats(typed, passage, totalKeystrokes, errors, elapsed);

  const isFinished = typed.length >= passage.length;

  const localRacer: Racer = {
    id: myPlayer.guestId,
    name: myPlayer.name,
    progress: getForwardProgress(totalKeystrokes, errors, passage.length, isFinished),
    color: myPlayer.color as RacerColor,
    finished: isFinished,
  };

  const racers = [localRacer, ...remotePlayers];

  const rankings =
    gameStatus === "finished"
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
            const remoteStats = getRemotePlayerStats(
              p.typedLength,
              passage.length,
              p.totalKeystrokes,
              p.errors,
              elapsed,
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">hyper-typer</h1>
        <p className="text-sm text-muted-foreground">
          {gameStatus === "running" ? "Type fast, type accurate!" : "Game complete!"}
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
          <MultiplayerResults
            rankings={rankings}
            myVote={myVote}
            voteSummary={voteSummary}
            onReplay={onReplay}
            onLeave={onLeave}
          />
        )}
      </Card>
    </main>
  );
}
