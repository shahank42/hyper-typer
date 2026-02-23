import { Copy, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";

interface LobbyProps {
  players: { name: string; color: string }[];
  isHost: boolean;
  shareUrl: string;
  onStart: () => void;
  canStart: boolean;
}

const COLOR_DOTS: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

/** Pre-game lobby showing player list, shareable room link, and host start button. */
export function Lobby({ players, isHost, shareUrl, onStart, canStart }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Players</h2>
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div
                className={`h-3 w-3 rounded-full ${COLOR_DOTS[player.color] ?? "bg-gray-500"}`}
              />
              <span className="font-medium">{player.name}</span>
              {i === 0 && <span className="text-xs text-muted-foreground">(host)</span>}
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No players yet. Share the link below to invite friends!
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Share this link</label>
        <div className="flex gap-2">
          <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono truncate">
            {shareUrl}
          </code>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {isHost && (
        <Button onClick={onStart} disabled={!canStart} size="lg" className="w-full">
          Start Race
        </Button>
      )}

      {!isHost && (
        <p className="text-sm text-center text-muted-foreground">
          Waiting for the host to start the race...
        </p>
      )}
    </div>
  );
}
