import type { PlayerStats } from "~/lib/types";

/**
 * Compute typing performance stats from raw input data. Pure function — no
 * React, no side effects. Works for any player (local or remote).
 *
 * WPM uses the standard formula: (correct characters / 5) / minutes elapsed.
 * Accuracy is keystroke-based: (total - errors) / total. Backspace does not
 * recover accuracy — once an error is counted, it stays.
 *
 * Returns zeroed/defaulted stats for edge cases (no time elapsed, no input).
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
  const rawWpm = Math.round(correctChars / 5 / (elapsedSeconds / 60));
  const wpm = Number.isFinite(rawWpm) ? rawWpm : 0;

  const rawAccuracy =
    totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
  const accuracy = Number.isFinite(rawAccuracy) ? rawAccuracy : 100;

  return { wpm, accuracy, progress };
}
