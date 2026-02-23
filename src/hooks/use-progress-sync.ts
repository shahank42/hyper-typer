import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { GameStatus } from "~/lib/types";

const SYNC_INTERVAL_MS = 300;

interface ProgressData {
  typedLength: number;
  totalKeystrokes: number;
  errors: number;
}

/**
 * Throttled progress sync for multiplayer.
 *
 * Sets up a single interval that reads the latest progress from refs and
 * calls `updateProgress` every ~300ms.
 *
 * Also watches for completion (typedLength >= passageLength) and calls
 * `finish` exactly once when the passage is completed.
 *
 * Effect count: 2 (interval + completion check).
 */
export function useProgressSync(
  gameId: Id<"games">,
  guestId: string,
  passageLength: number,
  progress: ProgressData,
  gameStatus: GameStatus,
) {
  const updateProgress = useMutation(api.games.updateProgress);
  const finishPlayer = useMutation(api.games.finishPlayer);

  const progressRef = useRef(progress);
  progressRef.current = progress;

  const lastSyncRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (gameStatus !== "running") return;
    finishedRef.current = false;
  }, [gameStatus]);

  const finish = useCallback(() => {
    if (finishedRef.current || gameStatus !== "running") return;
    finishedRef.current = true;

    const p = progressRef.current;
    updateProgress({
      gameId,
      guestId,
      typedLength: p.typedLength,
      totalKeystrokes: p.totalKeystrokes,
      errors: p.errors,
    });

    finishPlayer({ gameId, guestId });
  }, [gameId, guestId, gameStatus, updateProgress, finishPlayer]);

  useEffect(() => {
    if (gameStatus !== "running" || !guestId || passageLength <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSyncRef.current < SYNC_INTERVAL_MS) return;

      lastSyncRef.current = now;
      const p = progressRef.current;

      updateProgress({
        gameId,
        guestId,
        typedLength: p.typedLength,
        totalKeystrokes: p.totalKeystrokes,
        errors: p.errors,
      });
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [gameId, guestId, gameStatus, passageLength, updateProgress]);

  useEffect(() => {
    if (gameStatus === "running" && passageLength > 0 && progress.typedLength >= passageLength) {
      finish();
    }
  }, [gameStatus, passageLength, progress.typedLength, finish]);

  return { finish };
}
