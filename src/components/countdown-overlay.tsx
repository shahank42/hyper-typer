interface CountdownOverlayProps {
  seconds: number;
}

/** Full-screen 3-2-1 countdown overlay shown during the countdown phase. */
export function CountdownOverlay({ seconds }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none transition-all duration-1000">
      <div className="text-[200px] font-bold tabular-nums text-primary tracking-tighter drop-shadow-2xl opacity-90 transition-all scale-110">
        {seconds > 0 ? seconds : "GO!"}
      </div>
      <p className="text-xl font-bold uppercase tracking-[0.5em] text-muted-foreground mt-4 opacity-50">
        Get ready
      </p>
    </div>
  );
}
