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
    <div className="flex items-center gap-12 font-mono text-primary w-full justify-start opacity-80 mb-4 transition-opacity duration-500">
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Time
        </span>
        <span
          className={cn(
            "text-4xl font-bold tabular-nums tracking-tighter transition-colors",
            timeLeft <= 5 && gameStatus === "running" && "text-red-500 animate-pulse",
          )}
        >
          {timeLeft}
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          WPM
        </span>
        <span className="text-4xl font-bold tabular-nums tracking-tighter">{wpm}</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          ACC
        </span>
        <span className="text-4xl font-bold tabular-nums tracking-tighter">{accuracy}%</span>
      </div>
    </div>
  );
}
