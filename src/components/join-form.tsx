import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface JoinFormProps {
  onJoin: (name: string) => void;
  isLoading: boolean;
}

/** Name input form shown to visitors who haven't joined a room yet. */
export function JoinForm({ onJoin, isLoading }: JoinFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onJoin(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <label
          htmlFor="player-name"
          className="text-sm uppercase tracking-widest font-bold text-muted-foreground"
        >
          Enter your name
        </label>
        <Input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest"
          maxLength={20}
          autoFocus
          disabled={isLoading}
          className="h-16 text-2xl px-6 border-2 border-border/50 bg-muted/10 font-bold focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
        />
      </div>
      <Button
        type="submit"
        disabled={!name.trim() || isLoading}
        className="w-full h-16 text-lg uppercase tracking-wider font-bold rounded-2xl"
      >
        {isLoading ? "Joining..." : "Join Race"}
      </Button>
    </form>
  );
}
