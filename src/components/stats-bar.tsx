import type { GameStatus } from "~/lib/types";
import { cn } from "~/lib/utils";

interface StatsBarProps {
  timeLeft: number;
  wpm: number;
  accuracy: number;
  gameStatus: GameStatus;
}

/**
 * Horizontal bar displaying the local player's live stats: remaining time,
 * words per minute, and accuracy percentage.
 *
 * The time display flashes red when 5 seconds or fewer remain and the
 * game is still running. All numbers use tabular-nums for stable layout.
 */
export function StatsBar({ timeLeft, wpm, accuracy, gameStatus }: StatsBarProps) {
  return (
    <div className="flex items-center gap-6 text-sm font-mono">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">TIME</span>
        <span
          className={cn(
            "text-xl font-bold tabular-nums",
            timeLeft <= 5 && gameStatus === "running" && "text-red-500",
          )}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">WPM</span>
        <span className="text-xl font-bold tabular-nums">{wpm}</span>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">ACC</span>
        <span className="text-xl font-bold tabular-nums">{accuracy}%</span>
      </div>
    </div>
  );
}
