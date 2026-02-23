import type { GameStatus, Racer } from "~/lib/types";
import { cn } from "~/lib/utils";

import { CarSVG } from "~/components/race-track/car-svg";
import { CheckeredFlag } from "~/components/race-track/checkered-flag";

interface RaceTrackProps {
  racers: Racer[];
  gameStatus: GameStatus;
}

const GLOW_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
};

/**
 * Minimalist race track.
 * Each racer gets a sleek progress bar and their car SVG.
 */
export function RaceTrack({ racers, gameStatus }: RaceTrackProps) {
  return (
    <div className="w-full relative select-none mt-12 mb-8 max-w-5xl group">
      {/* Track Background with distance markers */}
      <div className="absolute inset-0 flex justify-between px-[2rem] pointer-events-none opacity-20 transition-opacity duration-1000 group-hover:opacity-30">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((m) => (
          <div key={m} className="h-full w-px bg-muted-foreground/30 relative">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-tighter">
              {m}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-10 relative z-10">
        {racers.map((racer) => {
          const percentage = Math.min(racer.progress * 100, 100);
          const isMoving = gameStatus === "running" && !racer.finished && racer.progress > 0;

          return (
            <div key={racer.id} className="w-full relative group/lane">
              {/* Lane Info */}
              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm transition-all duration-300",
                    "bg-muted text-muted-foreground group-hover/lane:bg-primary/10 group-hover/lane:text-primary",
                    isMoving && "ring-1 ring-primary/20"
                  )}>
                    {racer.name}
                  </span>
                  {racer.finished && (
                    <span className="text-[10px] font-bold text-green-500 animate-pulse">FINISHED</span>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-0 group-hover/lane:opacity-100 transition-opacity">
                  {Math.round(percentage)}%
                </span>
              </div>

              {/* Progress Line Container */}
              <div className="h-0.5 w-full bg-muted/40 rounded-full relative overflow-visible">
                <div
                  className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ left: `calc(${percentage}% - 1.25rem)` }}
                >
                  <div className={cn(
                    "relative group/car transition-transform duration-300 hover:scale-110",
                    isMoving && "animate-[tw-shake_0.2s_ease-in-out_infinite]"
                  )}>
                    <CarSVG
                      color={racer.color}
                      className={cn(
                        "h-8 w-auto -scale-x-100 transition-all",
                        racer.finished && "animate-bounce",
                      )}
                    />
                    {/* Visual Glow behind car */}
                    <div 
                      className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-16 blur-xl transition-opacity duration-500 pointer-events-none -z-10",
                        isMoving ? "opacity-30" : "opacity-0 group-hover/lane:opacity-20"
                      )}
                      style={{ 
                        backgroundColor: GLOW_COLORS[racer.color] || "#888"
                      }}
                    />
                  </div>
                </div>

                {/* Checkered flag at finish */}
                <div className={cn(
                  "absolute right-[-1rem] top-1/2 -translate-y-1/2 z-0 transition-all duration-500",
                  racer.finished ? "opacity-100 scale-110" : "opacity-10 scale-90"
                )}>
                  <CheckeredFlag className="h-6 w-auto" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
