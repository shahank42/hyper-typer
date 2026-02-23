import type { GameStatus } from "~/lib/types";

interface TrafficLightProps {
  status: GameStatus;
  className?: string;
}

export function TrafficLight({ status, className }: TrafficLightProps) {
  return (
    <svg viewBox="0 0 28 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect
        x="11"
        y="40"
        width="6"
        height="24"
        rx="2"
        className="fill-gray-500 dark:fill-gray-400"
      />
      <rect
        x="2"
        y="2"
        width="24"
        height="40"
        rx="4"
        className="fill-gray-800 dark:fill-gray-700"
      />

      <circle
        cx="14"
        cy="12"
        r="5"
        className={
          status === "idle"
            ? "fill-red-500 dark:fill-red-400"
            : "fill-red-500/40 dark:fill-red-400/30"
        }
      />
      {status === "idle" && (
        <circle cx="14" cy="12" r="7" className="fill-red-400/20 dark:fill-red-300/20" />
      )}

      <circle
        cx="14"
        cy="24"
        r="5"
        className={
          status === "finished"
            ? "fill-amber-400 dark:fill-amber-300"
            : "fill-amber-400/40 dark:fill-amber-300/30"
        }
      />
      {status === "finished" && (
        <circle cx="14" cy="24" r="7" className="fill-amber-300/20 dark:fill-amber-200/20" />
      )}

      <circle
        cx="14"
        cy="36"
        r="5"
        className={
          status === "running"
            ? "fill-green-500 dark:fill-green-400"
            : "fill-green-500/40 dark:fill-green-400/30"
        }
      />
      {status === "running" && (
        <circle cx="14" cy="36" r="7" className="fill-green-400/20 dark:fill-green-300/20" />
      )}
    </svg>
  );
}
