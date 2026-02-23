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
    <div className="w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="text-left space-y-16 w-full max-w-4xl">
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary/50">Performance Report</h2>
          <div className="flex items-baseline gap-4">
            <div className="text-[120px] font-black tracking-tighter leading-none text-foreground leading-[0.8]">
              {wpm}
            </div>
            <div className="text-2xl font-bold uppercase tracking-widest text-muted-foreground opacity-50">WPM</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-border/50 pt-12">
          <div className="space-y-1">
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Accuracy</div>
            <div className="text-4xl font-black tabular-nums">{accuracy}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Completed</div>
            <div className="text-4xl font-black tabular-nums">{Math.round(progress * 100)}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Rank</div>
            <div className="text-4xl font-black tracking-tight italic">S-Tier</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 pt-8">
          <Button 
            onClick={onRestart} 
            size="lg" 
            className="h-16 px-12 text-lg uppercase font-black tracking-widest rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Race Again
          </Button>
          <div className="flex items-center gap-3 text-muted-foreground/40 font-mono text-sm uppercase tracking-widest">
            <kbd className="rounded-md border border-border/50 bg-muted px-2 py-1 text-xs font-black text-muted-foreground/60">TAB</kbd>
            <span>+</span>
            <kbd className="rounded-md border border-border/50 bg-muted px-2 py-1 text-xs font-black text-muted-foreground/60">ENTER</kbd>
            <span className="ml-2 font-bold italic">to quick restart</span>
          </div>
        </div>
      </div>
    </div>
  );
}
