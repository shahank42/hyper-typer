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
          "w-full cursor-text relative transition-opacity duration-300 py-4",
          gameStatus === "finished" && "opacity-30 blur-[2px] pointer-events-none",
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
