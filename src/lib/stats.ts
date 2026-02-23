import type { PlayerStats } from "~/lib/types";
import { CHARS_PER_WORD } from "~/lib/constants";

/**
 * Compute typing stats from raw input data.
 *
 * WPM: (correct characters / CHARS_PER_WORD) / minutes elapsed.
 * Accuracy: (total - errors) / total keystrokes. Backspace does not recover accuracy.
 */
export function getPlayerStats(
  typed: string,
  passage: string,
  totalKeystrokes: number,
  errors: number,
  elapsedSeconds: number,
): PlayerStats {
  const progress = passage.length > 0 ? typed.length / passage.length : 0;

  const correctChars = typed.split("").filter((char, i) => char === passage[i]).length;
  const rawWpm = Math.round(correctChars / CHARS_PER_WORD / (elapsedSeconds / 60));
  const wpm = Number.isFinite(rawWpm) ? rawWpm : 0;

  const rawAccuracy =
    totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
  const accuracy = Number.isFinite(rawAccuracy) ? rawAccuracy : 100;

  return { wpm, accuracy, progress };
}

/**
 * Forward-only car progress from keystroke counters.
 *
 * Unlike `typed.length / passage.length`, this never decreases:
 * correct keystrokes advance the car, errors stall it, backspace is a no-op.
 * Used for car position in multiplayer so cars never go backward.
 */
export function getForwardProgress(
  totalKeystrokes: number,
  errors: number,
  passageLength: number,
  finished: boolean,
): number {
  if (finished) return 1;
  if (passageLength <= 0) return 0;
  const correctKeystrokes = Math.max(0, totalKeystrokes - errors);
  return Math.min(1, correctKeystrokes / passageLength);
}

/**
 * Compute stats for a remote player from synced numeric counters.
 * Same formulas as `getPlayerStats` but without needing the typed string.
 */
export function getRemotePlayerStats(
  typedLength: number,
  passageLength: number,
  totalKeystrokes: number,
  errors: number,
  elapsedSeconds: number,
): PlayerStats {
  const progress = passageLength > 0 ? typedLength / passageLength : 0;

  const correctChars = Math.max(0, totalKeystrokes - errors);
  const rawWpm = Math.round(correctChars / CHARS_PER_WORD / (elapsedSeconds / 60));
  const wpm = Number.isFinite(rawWpm) ? rawWpm : 0;

  const rawAccuracy =
    totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
  const accuracy = Number.isFinite(rawAccuracy) ? rawAccuracy : 100;

  return { wpm, accuracy, progress };
}
