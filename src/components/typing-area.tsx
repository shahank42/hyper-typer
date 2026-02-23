import { useEffect, useRef } from "react";

import type { GameStatus } from "~/lib/types";
import { cn } from "~/lib/utils";

import { TypingDisplay } from "~/components/typing-display";

interface TypingAreaProps {
  passage: string;
  typed: string;
  gameStatus: GameStatus;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Wraps `TypingDisplay` with a hidden `<input>` that captures keystrokes.
 *
 * The visible area shows the passage with character-by-character coloring.
 * Clicking anywhere in the area focuses the hidden input. Focus is also
 * re-acquired on status changes and on blur, so the input is effectively
 * always focused while the component is mounted.
 *
 * The area dims to 50% opacity when the game is finished, and the hidden
 * input is disabled to prevent further typing.
 */
export function TypingArea({ passage, typed, gameStatus, onChange, onKeyDown }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [gameStatus]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <div
        className={cn(
          "rounded-lg border border-border bg-muted/30 p-6 cursor-text min-h-[120px]",
          gameStatus === "finished" && "opacity-50",
        )}
        onClick={focusInput}
      >
        <TypingDisplay passage={passage} typed={typed} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onBlur={focusInput}
        className="sr-only"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Type the passage here"
        disabled={gameStatus === "finished"}
      />
    </>
  );
}
