import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Racer, RacerColor } from "~/lib/types";
import { pickRandom } from "~/lib/passages";

import { RaceTrack } from "~/components/race-track";
import { Lobby } from "~/components/lobby";
import { JoinForm } from "~/components/join-form";
import { CountdownOverlay } from "~/components/countdown-overlay";
import { useGuestId } from "~/hooks/use-guest-id";
import { useMultiplayerGame } from "~/hooks/use-multiplayer-game";
import { RaceView } from "~/components/race-view";

export const Route = createFileRoute("/room/$roomId")({
  component: RoomPage,
});

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
    elapsedTime,
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

  // Early returns - all hooks must be called before these
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
      <main className="min-h-screen flex flex-col items-center justify-center p-8 max-w-5xl mx-auto gap-12">
        <div className="w-full text-left opacity-50 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">hyper-typer</h1>
          <p className="text-sm text-muted-foreground mt-2">Join this room!</p>
        </div>
        <div className="w-full max-w-md">
          <JoinForm onJoin={handleJoin} isLoading={isJoining} />
        </div>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (game.status === "waiting") {
    const handleStart = () => {
      startMutation({ roomId: typedRoomId, guestId });
    };

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 max-w-5xl mx-auto gap-12">
        <div className="w-full text-left opacity-50 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">hyper-typer</h1>
          <p className="text-sm text-muted-foreground mt-2">Waiting for players...</p>
        </div>
        <div className="w-full max-w-xl">
          <Lobby
            players={players.map((p) => ({ name: p.name, color: p.color }))}
            isHost={isHost}
            shareUrl={shareUrl}
            onStart={handleStart}
            canStart={players.length >= 1}
          />
        </div>
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
      <main className="min-h-screen flex flex-col items-center justify-center p-8 max-w-5xl mx-auto gap-12 relative">
        <div className="w-full text-left opacity-50 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">hyper-typer</h1>
          <p className="text-sm text-muted-foreground mt-2">Get ready!</p>
        </div>
        <div className="w-full space-y-12 relative opacity-50 blur-sm pointer-events-none transition-all duration-1000">
          <RaceTrack racers={allRacersAtZero} gameStatus="idle" />
        </div>
        <CountdownOverlay seconds={countdownSeconds} />
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
      elapsedTime={elapsedTime}
      myVote={myVote}
      voteSummary={voteSummary}
      onReplay={handleReplay}
      onLeave={handleLeave}
    />
  );
}
