/**
 * `v-reveal` — fade an element up as it scrolls into view.
 *
 * Replaces the original page's `querySelectorAll('.reveal')` loop. As a
 * directive it is declarative at the point of use and each element cleans
 * up its own observer, so nothing leaks when a page unmounts.
 *
 * Client-only: there is no IntersectionObserver during prerender, and the
 * resting state of `.reveal` is visible, so a prerendered page that never
 * runs this still shows all its content.
 */

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -8% 0px",
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", {
    mounted(element: HTMLElement) {
      element.classList.add("reveal");

      // No IntersectionObserver (or a very old browser): show it immediately
      // rather than leaving content stuck at opacity 0.
      if (!("IntersectionObserver" in window)) {
        element.classList.add("in");
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }, OBSERVER_OPTIONS);

      observer.observe(element);

      // Stash it so unmounted() can disconnect.
      revealObservers.set(element, observer);
    },

    unmounted(element: HTMLElement) {
      revealObservers.get(element)?.disconnect();
      revealObservers.delete(element);
    },
  });
});

/** Per-element observers, so each can be disconnected on unmount. */
const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>();
