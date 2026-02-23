import type { RacerColor } from "~/lib/types";

/**
 * Maps each `RacerColor` to Tailwind fill classes for the car body and taillight.
 * The body color is the primary visual identifier on the track; the taillight
 * uses a lighter shade of the same hue.
 */
const COLOR_MAP: Record<RacerColor, { body: string; taillight: string }> = {
  red: {
    body: "fill-red-500 dark:fill-red-400",
    taillight: "fill-red-300 dark:fill-red-200",
  },
  blue: {
    body: "fill-blue-500 dark:fill-blue-400",
    taillight: "fill-blue-300 dark:fill-blue-200",
  },
  green: {
    body: "fill-green-500 dark:fill-green-400",
    taillight: "fill-green-300 dark:fill-green-200",
  },
  purple: {
    body: "fill-purple-500 dark:fill-purple-400",
    taillight: "fill-purple-300 dark:fill-purple-200",
  },
  orange: {
    body: "fill-orange-500 dark:fill-orange-400",
    taillight: "fill-orange-300 dark:fill-orange-200",
  },
};

interface CarSVGProps {
  color: RacerColor;
  className?: string;
}

/**
 * Racing car SVG graphic. The body and taillight colors are driven by
 * the `color` prop via `COLOR_MAP`; all other parts (windows, wheels,
 * headlight, exhaust) use fixed neutral/accent colors.
 *
 * ViewBox is 120x50. Intended to be rendered at `h-9` to `h-11`.
 */
export function CarSVG({ color, className }: CarSVGProps) {
  const colors = COLOR_MAP[color];

  return (
    <svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M15 30 Q15 22 25 22 L40 22 L50 12 L85 12 Q95 12 95 22 L105 22 Q110 22 110 28 L110 34 Q110 38 106 38 L14 38 Q10 38 12 34 Z"
        className={colors.body}
      />
      <path
        d="M50 14 L42 22 L68 22 L68 14 Z"
        className="fill-sky-200 dark:fill-sky-300/80"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
      <path
        d="M70 14 L70 22 L88 22 Q90 14 85 14 Z"
        className="fill-sky-200 dark:fill-sky-300/80"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
      <path d="M50 12 L85 12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
      <rect
        x="10"
        y="27"
        width="6"
        height="4"
        rx="1"
        className="fill-amber-300 dark:fill-amber-200"
      />
      <rect x="107" y="27" width="4" height="4" rx="1" className={colors.taillight} />
      <rect x="20" y="24" width="80" height="2" rx="1" className="fill-white/30" />
      <circle cx="30" cy="38" r="8" className="fill-gray-800 dark:fill-gray-200" />
      <circle cx="30" cy="38" r="5" className="fill-gray-500 dark:fill-gray-400" />
      <circle cx="30" cy="38" r="2" className="fill-gray-700 dark:fill-gray-300" />
      <circle cx="90" cy="38" r="8" className="fill-gray-800 dark:fill-gray-200" />
      <circle cx="90" cy="38" r="5" className="fill-gray-500 dark:fill-gray-400" />
      <circle cx="90" cy="38" r="2" className="fill-gray-700 dark:fill-gray-300" />
      <circle cx="114" cy="33" r="2" className="fill-gray-400/40 dark:fill-gray-500/40" />
      <circle cx="118" cy="31" r="1.5" className="fill-gray-400/25 dark:fill-gray-500/25" />
    </svg>
  );
}
