import type { GameStatus } from "~/lib/types";

interface StatsBarProps {
  elapsedTime?: number;
  wpm: number;
  accuracy: number;
  gameStatus: GameStatus;
}

/**
 * Horizontal bar displaying the local player's live stats: elapsed time,
 * words per minute, and accuracy percentage.
 *
 * When elapsedTime is provided, shows counting time (stopwatch).
 * Otherwise shows timeLeft for countdown mode.
 */
export function StatsBar({ elapsedTime, wpm, accuracy, gameStatus: _gameStatus }: StatsBarProps) {
  const showElapsed = elapsedTime !== undefined;
  const timeValue = showElapsed ? elapsedTime : 0;

  return (
    <div className="flex items-center gap-12 font-mono text-primary w-full justify-start opacity-80 mb-4 transition-opacity duration-500">
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          {showElapsed ? "Elapsed" : "Time"}
        </span>
        <span className="text-4xl font-bold tabular-nums tracking-tighter">{timeValue}</span>
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
