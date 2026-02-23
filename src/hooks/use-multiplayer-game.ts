import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Racer, RacerColor } from "~/lib/types";
import { getForwardProgress } from "~/lib/stats";
import { calculateElapsedSeconds } from "~/lib/time";
import { COUNTDOWN_DURATION, TIMER_INTERVAL_MS } from "~/lib/constants";

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
 * Derives elapsed time and countdown timers client-side from server timestamps.
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

  const derivedElapsedTime =
    game?.startedAt && game.status !== "waiting" && game.status !== "countdown"
      ? calculateElapsedSeconds(game.startedAt)
      : 0;

  const derivedCountdownSeconds =
    !game || game.status !== "countdown" || !game.countdownStartedAt
      ? 0
      : Math.max(
          0,
          COUNTDOWN_DURATION -
            Math.floor((Date.now() - game.countdownStartedAt) / TIMER_INTERVAL_MS),
        );

  /**
   * Single interval to trigger re-renders for active timers.
   * Uses TIMER_INTERVAL_MS since UI only displays whole seconds.
   */
  useEffect(() => {
    if (!game || (game.status !== "countdown" && game.status !== "running")) return;

    const interval = setInterval(() => setTick((t) => t + 1), TIMER_INTERVAL_MS);
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
    elapsedTime: derivedElapsedTime,
    countdownSeconds: derivedCountdownSeconds,
    myVote,
    voteSummary,
    isLoading: data === undefined,
  };
}
