interface CheckeredFlagProps {
  className?: string;
}

/**
 * Checkered finish flag SVG. Placed at the right end of the race track.
 * Features a pole, 4x2 checker pattern, and a decorative ball on top.
 *
 * ViewBox is 36x52. Intended to be rendered at `h-12`.
 */
export function CheckeredFlag({ className }: CheckeredFlagProps) {
  return (
    <svg viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect
        x="4"
        y="8"
        width="3"
        height="44"
        rx="1.5"
        className="fill-gray-500 dark:fill-gray-400"
      />
      <rect x="7" y="4" width="26" height="22" rx="1" className="fill-white dark:fill-gray-200" />
      <rect x="7" y="4" width="6.5" height="5.5" className="fill-gray-900 dark:fill-gray-800" />
      <rect x="20" y="4" width="6.5" height="5.5" className="fill-gray-900 dark:fill-gray-800" />
      <rect
        x="13.5"
        y="9.5"
        width="6.5"
        height="5.5"
        className="fill-gray-900 dark:fill-gray-800"
      />
      <rect
        x="26.5"
        y="9.5"
        width="6.5"
        height="5.5"
        className="fill-gray-900 dark:fill-gray-800"
      />
      <rect x="7" y="15" width="6.5" height="5.5" className="fill-gray-900 dark:fill-gray-800" />
      <rect x="20" y="15" width="6.5" height="5.5" className="fill-gray-900 dark:fill-gray-800" />
      <rect
        x="13.5"
        y="20.5"
        width="6.5"
        height="5.5"
        className="fill-gray-900 dark:fill-gray-800"
      />
      <rect
        x="26.5"
        y="20.5"
        width="6.5"
        height="5.5"
        className="fill-gray-900 dark:fill-gray-800"
      />
      <circle cx="5.5" cy="6" r="4" className="fill-amber-400 dark:fill-amber-300" />
    </svg>
  );
}
