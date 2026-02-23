const GUEST_ID_KEY = "hyper-typer-guest-id";

/**
 * Returns a stable anonymous guest ID from localStorage,
 * creating one with `crypto.randomUUID()` on first call.
 * Not SSR-safe — use `useGuestId()` in React components.
 */
export function getGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}
