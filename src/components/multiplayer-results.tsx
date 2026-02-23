import { RotateCcw, LogOut } from "lucide-react";

import type { RacerColor } from "~/lib/types";
import { cn } from "~/lib/utils";

interface PlayerRanking {
  name: string;
  color: RacerColor;
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
}

interface VoteSummaryEntry {
  name: string;
  color: string;
  vote: "replay" | "exit" | undefined;
}

interface MultiplayerResultsProps {
  rankings: PlayerRanking[];
  myVote: "replay" | "exit" | undefined;
  voteSummary: VoteSummaryEntry[];
  onReplay: () => void;
  onLeave: () => void;
}

const COLOR_TEXT: Record<string, string> = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
};

const MEDALS = ["1st", "2nd", "3rd", "4th", "5th"];

/**
 * Post-game results overlay with leaderboard and replay/leave voting.
 */
export function MultiplayerResults({
  rankings,
  myVote,
  voteSummary,
  onReplay,
  onLeave,
}: MultiplayerResultsProps) {
  const hasVoted = myVote !== undefined;
  const anyoneVoted = voteSummary.some((v) => v.vote !== undefined);
  const waitingCount = voteSummary.filter((v) => v.vote === undefined).length;

  const topThree = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-12 w-full max-w-4xl px-8">
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary/50">
            Leaderboard
          </h2>
          <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">
            The Race is Over
          </h1>
        </div>

        {/* Podium View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
          {topThree.map((player, i) => {
            const isWinner = i === 0;
            return (
              <div
                key={player.name}
                className={cn(
                  "flex flex-col items-center gap-4 group/podium transition-all duration-500",
                  isWinner ? "order-2 md:-translate-y-8" : i === 1 ? "order-1" : "order-3",
                )}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-2">
                  {MEDALS[i]} PLACE
                </div>
                <div
                  className={cn(
                    "w-full rounded-2xl border border-border/50 p-6 space-y-4 transition-all hover:border-primary/20",
                    isWinner ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/10",
                  )}
                >
                  <div
                    className={cn(
                      "font-black text-2xl tracking-tight truncate",
                      COLOR_TEXT[player.color],
                    )}
                  >
                    {player.name}
                  </div>
                  <div className="flex justify-center items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums">{player.wpm}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      WPM
                    </span>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground/60">
                    {player.accuracy}% Accuracy
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other participants */}
        {others.length > 0 && (
          <div className="space-y-2 max-w-xl mx-auto border-t border-border/50 pt-8 mt-8">
            {others.map((player, i) => (
              <div
                key={player.name}
                className="flex items-center gap-4 px-6 py-3 rounded-xl bg-muted/5 border border-border/20"
              >
                <span className="text-xs font-bold text-muted-foreground w-8">{MEDALS[i + 3]}</span>
                <span className={cn("font-bold flex-1 text-left", COLOR_TEXT[player.color])}>
                  {player.name}
                </span>
                <span className="font-mono font-bold text-sm">{player.wpm} WPM</span>
                <span className="text-xs font-bold text-muted-foreground/50 w-12 text-right">
                  {player.accuracy}%
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-md mx-auto w-full bg-muted/5 border border-border/50 rounded-3xl overflow-hidden flex flex-col pt-8">
          <div className="px-8 pb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 text-left">
              Player Readiness
            </p>
          </div>

          <div className="flex-1 px-8 pb-8 space-y-3">
            {voteSummary.map((entry) => (
              <div
                key={entry.name}
                className={cn(
                  "flex items-center gap-4 transition-all",
                  entry.vote === "exit" ? "opacity-30" : "opacity-100",
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    entry.vote === "replay"
                      ? "bg-green-500 animate-pulse"
                      : entry.vote === "exit"
                        ? "bg-red-400"
                        : "bg-muted-foreground/30",
                  )}
                />
                <span
                  className={cn(
                    "font-black tracking-tight flex-1 text-left",
                    COLOR_TEXT[entry.color] ?? "",
                  )}
                >
                  {entry.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                  {entry.vote === "replay"
                    ? "Ready"
                    : entry.vote === "exit"
                      ? "Left"
                      : "Deciding"}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 border-t border-border/50 h-20 shrink-0">
            <button
              onClick={onReplay}
              disabled={hasVoted}
              className="flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none border-r border-border/50 cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              Replay
            </button>
            <button
              onClick={onLeave}
              disabled={hasVoted}
              className="flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              Leave
            </button>
          </div>
        </div>

        <div className="h-8 flex flex-col justify-center">
          {myVote === "exit" && (
            <p className="text-xs font-bold italic text-red-400 animate-pulse">Exiting room...</p>
          )}
          {waitingCount === 0 && anyoneVoted && (
            <p className="text-xs font-black uppercase tracking-[0.3em] text-green-500 animate-pulse">
              Launching next race...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
