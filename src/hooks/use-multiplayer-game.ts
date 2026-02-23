import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Racer, RacerColor } from "~/lib/types";
import { getForwardProgress } from "~/lib/stats";

interface VoteSummaryEntry {
  name: string;
  color: string;
  vote: "replay" | "exit" | undefined;
}

/**
 * Convex subscription for the multiplayer UI.
 *
 * Subscribes to the room's current game and players via `games.get`.
 * When a replay swings `currentGameId` to a new game, this hook
 * automatically returns the new data — no navigation needed.
 *
 * Derives countdown and race timers client-side from server timestamps.
 * Timer state is derived during render to avoid effect synchronization issues.
 *
 * Effect count: 1 (single interval for active timers).
 */
export function useMultiplayerGame(roomId: Id<"rooms">, guestId: string) {
  const data = useQuery(api.games.get, { roomId });

  const [, setTick] = useState(0);

  const room = data?.room ?? null;
  const game = data?.game ?? null;
  const players = data?.players ?? [];

  // Derive timeLeft and countdownSeconds during render from server timestamps.
  // This eliminates the need for effect-based state resets.
  const derivedTimeLeft =
    !game || game.status === "waiting" || game.status === "countdown"
      ? (game?.duration ?? 30)
      : game.status === "finished"
        ? 0
        : Math.max(0, game.duration - Math.floor((Date.now() - game.startedAt!) / 1000));

  const derivedCountdownSeconds =
    !game || game.status !== "countdown" || !game.countdownStartedAt
      ? 0
      : Math.max(0, 3 - Math.floor((Date.now() - game.countdownStartedAt) / 1000));

  // Single interval to trigger re-renders for active timers.
  // Uses 1000ms since UI only displays whole seconds.
  useEffect(() => {
    if (!game || (game.status !== "countdown" && game.status !== "running")) return;

    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [game?._id, game?.status]);

  const isHost = room ? room.hostId === guestId : false;
  const myPlayer = players.find((p) => p.guestId === guestId);

  const remotePlayers: Racer[] = players
    .filter((p) => p.guestId !== guestId)
    .map((p) => ({
      id: p.guestId,
      name: p.name,
      progress: game
        ? getForwardProgress(p.totalKeystrokes, p.errors, game.passage.length, p.finished)
        : 0,
      color: p.color as RacerColor,
      finished: p.finished,
    }));

  const passage = game?.passage ?? "";
  const gameId = game?._id ?? null;

  const myVote = myPlayer?.vote;
  const voteSummary: VoteSummaryEntry[] = players.map((p) => ({
    name: p.name,
    color: p.color,
    vote: p.vote,
  }));

  return {
    room,
    game,
    gameId,
    players,
    passage,
    isHost,
    myPlayer,
    remotePlayers,
    timeLeft: derivedTimeLeft,
    countdownSeconds: derivedCountdownSeconds,
    myVote,
    voteSummary,
    isLoading: data === undefined,
  };
}
