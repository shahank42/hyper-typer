interface CountdownOverlayProps {
  seconds: number;
}

/** Full-screen 3-2-1 countdown overlay shown during the countdown phase. */
export function CountdownOverlay({ seconds }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-30">
      <div className="text-center">
        <div className="text-8xl font-bold tabular-nums text-primary animate-pulse">
          {seconds > 0 ? seconds : "GO!"}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Get ready...</p>
      </div>
    </div>
  );
}
