import { useCallback, useEffect, useRef, useState } from "react";

import type { GameStatus } from "~/lib/types";
import { pickRandom } from "~/lib/passages";

const TEST_DURATION = 30;

/**
 * Manages the solo game lifecycle: passage selection, countdown timer,
 * and status transitions (idle → running → finished).
 *
 * In multiplayer, this entire hook is replaced by `useMultiplayerGame(gameId)`
 * which returns the same shape from Convex subscriptions.
 *
 * - `start()` is called by `useLocalTyping`'s `onStart` callback on first keystroke.
 * - `restart()` picks a new passage and resets the timer.
 * - Timer ticks every 1000ms using `Date.now()` deltas for drift-resistant countdown.
 *
 * Effect count: 1 (cleanup on unmount).
 */
export function useSoloGame() {
  const [passage, setPassage] = useState(() => pickRandom());
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      const remaining = Math.max(0, TEST_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        setGameStatus("finished");
      }
    }, 1000);
    setGameStatus("running");
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    setPassage(pickRandom(passage));
    setGameStatus("idle");
    setTimeLeft(TEST_DURATION);
    startTimeRef.current = null;
  }, [clearTimer, passage]);

  return { passage, gameStatus, timeLeft, start, restart };
}
