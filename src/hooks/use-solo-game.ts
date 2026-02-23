import { useCallback, useEffect, useRef, useState } from "react";

import type { GameStatus } from "~/lib/types";
import { pickRandom } from "~/lib/passages";
import { calculateElapsedSeconds } from "~/lib/time";
import { TIMER_INTERVAL_MS } from "~/lib/constants";

/**
 * Manages the solo game lifecycle: passage selection, elapsed time counter,
 * and status transitions (idle → running → finished).
 *
 * Game ends when the user completes the passage (reaches the finish line),
 * not when a timer expires.
 *
 * - `start()` is called by `useLocalTyping`'s `onStart` callback on first keystroke.
 * - `restart()` picks a new passage and resets state.
 * - Elapsed time counts up from 0 while the game is running.
 * - `finalTime` is captured when the player finishes (for frozen WPM display).
 *
 * Effect count: 1 (cleanup on unmount).
 */
export function useSoloGame() {
  const [passage, setPassage] = useState(() => pickRandom());
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Clears the active game timer.
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Starts the game and the timer.
   */
  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = calculateElapsedSeconds(startTimeRef.current ?? undefined);
      setElapsedTime(elapsed);
    }, TIMER_INTERVAL_MS);
    setGameStatus("running");
  }, []);

  /**
   * Finalizes the game, captures the final time, and clears the timer.
   */
  const finish = useCallback(() => {
    clearTimer();
    const finalElapsed = calculateElapsedSeconds(startTimeRef.current ?? undefined);
    setElapsedTime(finalElapsed);
    setFinalTime(finalElapsed);
    setGameStatus("finished");
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  /**
   * Resets the game state to idle and picks a new passage.
   */
  const restart = useCallback(() => {
    clearTimer();
    setPassage(pickRandom(passage));
    setGameStatus("idle");
    setElapsedTime(0);
    setFinalTime(null);
    startTimeRef.current = null;
  }, [clearTimer, passage]);

  return { passage, gameStatus, elapsedTime, finalTime, start, finish, restart };
}
