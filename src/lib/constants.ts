/**
 * Game configuration constants.
 */

import type { RacerColor } from "~/lib/types";

/**
 * Duration of the countdown phase in seconds.
 */
export const COUNTDOWN_DURATION = 3;

/**
 * Frequency of timer updates in milliseconds.
 */
export const TIMER_INTERVAL_MS = 1000;

/**
 * Minimum elapsed time to avoid division by zero when calculating WPM.
 */
export const MIN_ELAPSED_SECONDS = 0.1;

/**
 * Standard number of characters considered as one "word" for WPM calculation.
 */
export const CHARS_PER_WORD = 5;

/**
 * Glow colors for each racer color, used for UI highlights and track effects.
 */
export const GLOW_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
};

/**
 * Maps each `RacerColor` to Tailwind fill classes for the car body and taillight.
 * The body color is the primary visual identifier on the track; the taillight
 * uses a lighter shade of the same hue.
 */
export const CAR_COLOR_MAP: Record<RacerColor, { body: string; taillight: string }> = {
  red: {
    body: "fill-red-500 dark:fill-red-400",
    taillight: "fill-red-300 dark:fill-red-200",
  },
  blue: {
    body: "fill-blue-500 dark:fill-blue-400",
    taillight: "fill-blue-300 dark:fill-blue-200",
  },
  green: {
    body: "fill-green-500 dark:fill-green-400",
    taillight: "fill-green-300 dark:fill-green-200",
  },
  purple: {
    body: "fill-purple-500 dark:fill-purple-400",
    taillight: "fill-purple-300 dark:fill-purple-200",
  },
  orange: {
    body: "fill-orange-500 dark:fill-orange-400",
    taillight: "fill-orange-300 dark:fill-orange-200",
  },
};

/**
 * Tailwind background classes for player indicators in the lobby.
 */
export const COLOR_DOTS: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

/**
 * Tailwind text color classes for player names in results and leaderboards.
 */
export const COLOR_TEXT: Record<string, string> = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
};

/**
 * Medal labels for the top finishers in a race.
 */
export const RANK_MEDALS = ["1st", "2nd", "3rd", "4th", "5th"];
