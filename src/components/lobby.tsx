import { Copy, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface LobbyProps {
  players: { name: string; color: string }[];
  isHost: boolean;
  shareUrl: string;
  onStart: () => void;
  canStart: boolean;
}

import { COLOR_DOTS } from "~/lib/constants";

export function Lobby({ players, isHost, shareUrl, onStart, canStart }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-50">
          Players joined
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-muted/10 border border-border/50 rounded-2xl px-6 py-5 transition-all hover:bg-muted/20 hover:scale-[1.02]"
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full shadow-lg",
                  COLOR_DOTS[player.color] ?? "bg-gray-500",
                )}
              />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xl tracking-tight">{player.name}</span>
                {i === 0 && (
                  <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                    Room Host
                  </span>
                )}
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-lg text-muted-foreground/50 font-medium italic text-left">
              Waiting for friends to join...
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-50 text-left block">
          Invite your rivals
        </label>
        <div className="flex gap-3">
          <code className="flex-1 rounded-2xl border border-border/50 bg-muted/10 px-6 py-4 text-lg font-mono truncate text-muted-foreground transition-all focus-within:border-primary/50 text-left">
            {shareUrl}
          </code>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            className="gap-2 h-auto px-8 rounded-2xl border border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
          >
            {copied ? (
              <Check className="h-6 w-6 text-green-500" />
            ) : (
              <Copy className="h-6 w-6 opacity-50" />
            )}
          </Button>
        </div>
      </div>

      {isHost ? (
        <Button
          onClick={onStart}
          disabled={!canStart}
          size="lg"
          className="w-full h-20 text-xl tracking-[0.2em] uppercase font-black rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Start the Race
        </Button>
      ) : (
        <div className="h-20 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground font-black uppercase tracking-[0.3em] opacity-50">
          Waiting for host
        </div>
      )}
    </div>
  );
}
