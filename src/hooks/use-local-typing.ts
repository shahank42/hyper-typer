import { useCallback, useRef, useState } from "react";

import type { GameStatus } from "~/lib/types";

interface UseLocalTypingOptions {
  /** Called on the first keystroke when `gameStatus` is `"idle"`. In solo mode
   *  this starts the timer; in multiplayer it could signal readiness to the server. */
  onStart?: () => void;
}

/**
 * Captures keystrokes against a passage and tracks accuracy metrics.
 * Always runs client-side — identical in solo and multiplayer.
 *
 * Keystroke rules:
 * - Forward typing increments `totalKeystrokes`; mismatches increment `errors`.
 * - Backspace is allowed (shrinks `typed`) but does NOT undo counted errors.
 * - Arrow keys and Home/End are blocked to prevent cursor repositioning.
 * - Input is clamped to `passage.length` — no typing beyond the end.
 * - All input is ignored once `gameStatus` is `"finished"`.
 *
 * The `onStart` callback fires exactly once, on the first character typed
 * while `gameStatus` is `"idle"`. It is stored in a ref to avoid re-creating
 * `handleChange` when the callback identity changes.
 */
export function useLocalTyping(
  passage: string,
  gameStatus: GameStatus,
  options?: UseLocalTypingOptions,
) {
  const [typed, setTyped] = useState("");
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);

  const onStartRef = useRef(options?.onStart);
  onStartRef.current = options?.onStart;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (gameStatus === "finished") return;

      const value = e.target.value;

      if (gameStatus === "idle" && value.length > 0) {
        onStartRef.current?.();
      }

      if (value.length > passage.length) return;

      if (value.length > typed.length) {
        setTotalKeystrokes((prev) => prev + 1);
        const newCharIndex = value.length - 1;
        if (value[newCharIndex] !== passage[newCharIndex]) {
          setErrors((prev) => prev + 1);
        }
      }

      setTyped(value);
    },
    [gameStatus, passage, typed.length],
  );

  /** Blocks navigation keys that would move the cursor away from the end. */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      e.preventDefault();
    }
  }, []);

  /** Resets all typing state. Called alongside `useSoloGame.restart()`. */
  const reset = useCallback(() => {
    setTyped("");
    setTotalKeystrokes(0);
    setErrors(0);
  }, []);

  return { typed, totalKeystrokes, errors, handleChange, handleKeyDown, reset };
}
