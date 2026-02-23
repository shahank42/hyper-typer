/**
 * Time utilities for the typing game.
 */

/**
 * Calculate elapsed seconds between start and end times.
 * Returns 0 if start time is invalid.
 */
export function calculateElapsedSeconds(
  startedAt: number | undefined,
  endedAt?: number | undefined,
  now: number = Date.now(),
): number {
  if (!startedAt) return 0;
  const endTime = endedAt ?? now;
  return Math.floor((endTime - startedAt) / 1000);
}
