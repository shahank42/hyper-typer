import { RotateCcw, LogOut, Check, X, Loader2 } from "lucide-react";

import type { RacerColor } from "~/lib/types";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

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
 * Always renders the vote list to avoid layout shift — before any votes,
 * all players show as "Deciding...".
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

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
      <div className="text-center space-y-6 w-full max-w-md px-4">
        <h2 className="text-2xl font-bold">Results</h2>

        <div className="space-y-3">
          {rankings.map((player, i) => (
            <div
              key={player.name}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
            >
              <span className="text-xs font-bold text-muted-foreground w-6">{MEDALS[i]}</span>
              <span className={`font-semibold flex-1 text-left ${COLOR_TEXT[player.color] ?? ""}`}>
                {player.name}
              </span>
              <span className="tabular-nums font-mono">{player.wpm} WPM</span>
              <span className="tabular-nums font-mono text-muted-foreground">
                {player.accuracy}%
              </span>
              <span className="tabular-nums font-mono text-muted-foreground">
                {Math.round(player.progress * 100)}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onReplay} disabled={hasVoted} size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Replay
          </Button>
          <Button
            onClick={onLeave}
            disabled={hasVoted}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground h-4">
            {myVote === "exit"
              ? "You left the room."
              : waitingCount === 0 && anyoneVoted
                ? "Starting..."
                : waitingCount < voteSummary.length
                  ? `Waiting for ${waitingCount} player${waitingCount > 1 ? "s" : ""}...`
                  : ""}
          </p>
          <div className="space-y-1.5">
            {voteSummary.map((entry) => (
              <div
                key={entry.name}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-3 py-1.5 text-sm transition-opacity",
                  entry.vote === "exit" ? "opacity-40" : "opacity-100",
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {entry.vote === "replay" && <Check className="h-4 w-4 text-green-500" />}
                  {entry.vote === "exit" && <X className="h-4 w-4 text-red-400" />}
                  {entry.vote === undefined && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                  )}
                </span>
                <span className={cn("flex-1 text-left font-medium", COLOR_TEXT[entry.color] ?? "")}>
                  {entry.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.vote === "replay"
                    ? "Wants to replay"
                    : entry.vote === "exit"
                      ? "Left"
                      : "Deciding..."}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
