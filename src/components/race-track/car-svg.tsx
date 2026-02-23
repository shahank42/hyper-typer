import type { RacerColor } from "~/lib/types";
import { CAR_COLOR_MAP } from "~/lib/constants";

interface CarSVGProps {
  color: RacerColor;
  className?: string;
}

export function CarSVG({ color, className }: CarSVGProps) {
  const colors = CAR_COLOR_MAP[color];

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
