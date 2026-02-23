import { useSyncExternalStore } from "react";

import { getGuestId } from "~/lib/guest";

/**
 * SSR-safe hook returning the guest's stable anonymous ID.
 *
 * Returns `""` during server rendering (TanStack Start SSR).
 * Callers should gate Convex operations on `guestId !== ""`.
 */
export function useGuestId(): string {
  return useSyncExternalStore(
    () => () => {},
    () => getGuestId(),
    () => "",
  );
}
