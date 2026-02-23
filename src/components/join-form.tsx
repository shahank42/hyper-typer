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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="player-name" className="text-sm font-medium">
          Enter your name
        </label>
        <Input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={20}
          autoFocus
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={!name.trim() || isLoading} className="w-full">
        {isLoading ? "Joining..." : "Join Race"}
      </Button>
    </form>
  );
}
