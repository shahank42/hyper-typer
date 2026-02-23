import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

interface TypingDisplayProps {
  passage: string;
  typed: string;
}

/**
 * Character-by-character rendering of the passage with live diff coloring.
 *
 * Each character is independently colored based on the player's input:
 * - **Correct** (typed and matches) — green
 * - **Incorrect** (typed but wrong) — red with a subtle red background
 * - **Current** (next character to type) — default foreground with an
 *   animated pulsing cursor bar to the left
 * - **Untyped** — dimmed muted foreground
 *
 * Pure component — receives `passage` and `typed` as props. Used by both
 * solo and multiplayer modes, always showing the local player's input.
 */
export function TypingDisplay({ passage, typed }: TypingDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentSpan = containerRef.current?.querySelector(".cursor-indicator");
    if (currentSpan) {
      currentSpan.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [typed]);

  return (
    <div
      ref={containerRef}
      className="font-mono text-3xl md:text-4xl leading-[1.6] tracking-wide select-none text-muted-foreground/30 break-words w-full max-h-[4.8em] overflow-hidden py-[1.6em]"
    >
      {passage.split("").map((char, i) => {
        const isTyped = i < typed.length;
        const isCurrent = i === typed.length;
        const isCorrect = isTyped && typed[i] === char;
        const isIncorrect = isTyped && typed[i] !== char;

        return (
          <span
            key={i}
            className={cn(
              "relative transition-colors duration-150 inline",
              isCorrect && "text-foreground",
              isIncorrect && "text-red-500 underline decoration-red-500/50 underline-offset-4",
              isCurrent && "text-muted-foreground cursor-indicator",
              !isTyped && !isCurrent && "text-muted-foreground/30",
            )}
          >
            {isCurrent && (
              <span className="absolute -left-[1px] top-1 bottom-1 w-[3px] bg-primary animate-pulse rounded-full" />
            )}
            {char}
          </span>
        );
      })}
    </div>
  );
}
