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
  return (
    <div className="font-mono text-lg leading-relaxed tracking-wide select-none">
      {passage.split("").map((char, i) => {
        const isTyped = i < typed.length;
        const isCurrent = i === typed.length;
        const isCorrect = isTyped && typed[i] === char;
        const isIncorrect = isTyped && typed[i] !== char;

        return (
          <span
            key={i}
            className={cn(
              "relative transition-colors duration-75",
              isCorrect && "text-green-500 dark:text-green-400",
              isIncorrect &&
                "text-red-500 bg-red-500/15 rounded-sm dark:text-red-400 dark:bg-red-400/15",
              isCurrent && "text-foreground",
              !isTyped && !isCurrent && "text-muted-foreground/60",
            )}
          >
            {isCurrent && (
              <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-primary animate-pulse" />
            )}
            {char}
          </span>
        );
      })}
    </div>
  );
}
