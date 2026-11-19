/**
 * Lets a "Try it free" button anywhere on the page drive the signup form.
 *
 * There are three of these buttons — header, hero, and the form's own submit
 * — and the first two sit in different component subtrees from the form.
 * Rather than have them reach into the DOM by ID, the signup section
 * registers itself here and the buttons call it.
 *
 * The behaviour matches the original page: a click shows the form instantly
 * (skipping its scroll-in fade, which would otherwise leave the visitor
 * looking at a blank panel), scrolls to it, then puts the cursor in the first
 * field once the scroll has settled.
 */

import { inject, provide, ref, type InjectionKey, type Ref } from "vue";
import { trackEvent } from "~/utils/analytics";

export interface SignupTarget {
  /** Put the cursor in the first field. */
  focusFirstField: () => void;
  /** Show the form now, without waiting for it to scroll into view. */
  revealNow: () => void;
}

const SIGNUP_TARGET: InjectionKey<Ref<SignupTarget | null>> =
  Symbol("quickturn:signup-target");

/**
 * How long to wait before focusing. Long enough for the smooth scroll to
 * finish — focusing mid-scroll makes the browser jump and fights the
 * animation.
 */
const SCROLL_SETTLE_MS = 600;

/** Call once, high in the tree, so both the header and the page can see it. */
export function provideSignupTarget(): Ref<SignupTarget | null> {
  const target = ref<SignupTarget | null>(null);
  provide(SIGNUP_TARGET, target);
  return target;
}

/** Used by the signup section to make itself the target. */
export function useSignupRegistration() {
  const target = inject(SIGNUP_TARGET, ref(null));

  return {
    register(handlers: SignupTarget) {
      target.value = handlers;
    },
  };
}

/**
 * Used by every "Try it free" button. `location` is passed straight to
 * analytics so we can tell which button mechanics actually press.
 */
export function useSignupCta() {
  const target = inject(SIGNUP_TARGET, ref(null));

  function goToSignup(location: string) {
    trackEvent("try_it_free_click", { location });

    target.value?.revealNow();

    // The form keeps its `id="signup"` from the original page: it is the
    // documented anchor, and the href on these buttons still points at it so
    // they work before hydration.
    document.getElementById("signup")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(
      () => target.value?.focusFirstField(),
      SCROLL_SETTLE_MS,
    );
  }

  return { goToSignup };
}
