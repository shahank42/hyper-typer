import type { GameStatus, Racer } from "~/lib/types";
import { cn } from "~/lib/utils";

import { CarSVG } from "~/components/race-track/car-svg";
import { CheckeredFlag } from "~/components/race-track/checkered-flag";
import { TrafficLight } from "~/components/race-track/traffic-light";

interface RaceTrackProps {
  racers: Racer[];
  gameStatus: GameStatus;
}

/** Height of each lane in pixels. */
const LANE_HEIGHT = 64;
/** Minimum track height when there are no racers. */
const MIN_TRACK_HEIGHT = 128;

/**
 * Renders N racers on a horizontal road with stacked lanes.
 *
 * The track scales vertically based on the number of racers — each gets their
 * own lane separated by dashed yellow dividers. With a single racer, a centered
 * dashed line is drawn instead.
 *
 * Cars travel horizontally from 6% to 88% of the track width, mapped from
 * `racer.progress` (0-1). A traffic light at the start reflects `gameStatus`,
 * and a checkered flag marks the finish line.
 *
 * Distance markers at 25%, 50%, and 75% provide visual reference points.
 * Each car shows the racer's name above it and bounces when `racer.finished`.
 */
export function RaceTrack({ racers, gameStatus }: RaceTrackProps) {
  const laneCount = Math.max(racers.length, 1);
  const trackHeight = Math.max(laneCount * LANE_HEIGHT, MIN_TRACK_HEIGHT);

  return (
    <div className="w-full select-none">
      <div
        className="relative w-full rounded-2xl overflow-hidden border-2 border-border bg-gradient-to-b from-green-800/20 via-green-900/10 to-green-800/20 dark:from-green-900/30 dark:via-green-950/20 dark:to-green-900/30"
        style={{ height: trackHeight }}
      >
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-green-600/15 to-transparent dark:from-green-500/10" />
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-green-600/15 to-transparent dark:from-green-500/10" />

        <div className="absolute inset-x-0 top-4 bottom-4 bg-gray-700/80 dark:bg-gray-600/50">
          <div className="absolute inset-x-2 top-0 h-[3px] bg-white/50 dark:bg-white/30 rounded-full" />
          <div className="absolute inset-x-2 bottom-0 h-[3px] bg-white/50 dark:bg-white/30 rounded-full" />

          {Array.from({ length: laneCount - 1 }).map((_, i) => {
            const topPercent = ((i + 1) / laneCount) * 100;
            return (
              <div
                key={i}
                className="absolute inset-x-6 border-t-[3px] border-dashed border-yellow-400/60 dark:border-yellow-300/40"
                style={{ top: `${topPercent}%`, transform: "translateY(-50%)" }}
              />
            );
          })}

          {laneCount === 1 && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-[3px] border-dashed border-yellow-400/60 dark:border-yellow-300/40" />
          )}
        </div>

        {[25, 50, 75].map((mark) => {
          const markerPos = 6 + (mark / 100) * 82;
          return (
            <div
              key={mark}
              className="absolute top-4 bottom-4 flex flex-col items-center justify-center"
              style={{ left: `${markerPos}%` }}
            >
              <div className="w-px h-full bg-white/10 dark:bg-white/5" />
              <span className="absolute -top-0.5 text-[9px] font-mono font-bold text-muted-foreground/50 tracking-tight">
                {mark}%
              </span>
            </div>
          );
        })}

        <div className="absolute right-10 top-4 bottom-4 w-4 grid grid-cols-2 grid-rows-8 opacity-50">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-full h-full",
                (Math.floor(i / 2) + (i % 2)) % 2 === 0
                  ? "bg-white dark:bg-gray-200"
                  : "bg-gray-900 dark:bg-gray-800",
              )}
            />
          ))}
        </div>

        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
          <TrafficLight status={gameStatus} className="h-14 w-auto" />
        </div>

        <div className="absolute right-1 top-1/2 -translate-y-[60%] z-10">
          <CheckeredFlag className="h-12 w-auto" />
        </div>

        {racers.map((racer, index) => {
          const percentage = Math.min(racer.progress * 100, 100);
          const carPosition = 6 + (percentage / 100) * 82;
          const laneCenterPercent = ((index + 0.5) / laneCount) * 100;

          return (
            <div
              key={racer.id}
              className="absolute z-20 transition-all duration-200 ease-out"
              style={{
                left: `calc(${carPosition}% - 2rem)`,
                top: `${laneCenterPercent}%`,
                transform: "translateY(-55%)",
              }}
            >
              <div className="relative">
                <CarSVG
                  color={racer.color}
                  className={cn("h-9 w-auto drop-shadow-lg", racer.finished && "animate-bounce")}
                />
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-foreground/70 whitespace-nowrap">
                  {racer.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
