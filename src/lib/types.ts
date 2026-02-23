/** Lifecycle state of a typing game. */
export type GameStatus = "idle" | "running" | "finished";

/** Computed performance metrics for a player at a point in time. */
export interface PlayerStats {
  /** Words per minute, based on correct characters typed. */
  wpm: number;
  /** Percentage of keystrokes that were correct (0-100). Never recovers from errors. */
  accuracy: number;
  /** Fraction of the passage completed (0-1). */
  progress: number;
}

/** Available car colors for the race track. One per player, max 5. */
export type RacerColor = "red" | "blue" | "green" | "purple" | "orange";

/** A single participant in a race, used to render a car on the track. */
export interface Racer {
  /** Unique identifier for this racer (e.g. guestId or "local"). */
  id: string;
  /** Display name shown above the car. */
  name: string;
  /** Fraction of the passage completed (0-1). Determines car position. */
  progress: number;
  /** Visual color of the car. */
  color: RacerColor;
  /** Whether this racer has typed the entire passage. Triggers bounce animation. */
  finished: boolean;
}
