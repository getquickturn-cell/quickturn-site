/**
 * Google Analytics, defensively.
 *
 * `gtag` is loaded from a third-party script (see `nuxt.config.ts`). An ad
 * blocker, a flaky connection, or a prerendered page that never hydrates all
 * leave it undefined — so every call goes through here and analytics failing
 * can never take a signup with it.
 */

type Gtag = (...args: unknown[]) => void;

/** Send an event if gtag is there; do nothing at all if it isn't. */
export function trackEvent(
  event: string,
  params: Record<string, unknown> = {},
): void {
  if (import.meta.server) return;

  const gtag = (window as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", event, params);
}
