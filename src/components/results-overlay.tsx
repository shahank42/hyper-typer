import { RotateCcw } from "lucide-react";

import { Button } from "~/components/ui/button";

interface ResultsOverlayProps {
  wpm: number;
  accuracy: number;
  progress: number;
  onRestart: () => void;
}

/**
 * Solo mode finish screen. Overlays the card with a blurred backdrop and
 * displays the player's final WPM, accuracy, and completion percentage.
 *
 * Not used in multiplayer — that mode has its own `MultiplayerResults`
 * component with a leaderboard layout.
 */
export function ResultsOverlay({ wpm, accuracy, progress, onRestart }: ResultsOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Race Finished!</h2>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{wpm}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{accuracy}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Accuracy
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{Math.round(progress * 100)}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Completed
            </div>
          </div>
        </div>
        <Button onClick={onRestart} size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Race Again
        </Button>
      </div>
    </div>
  );
}
