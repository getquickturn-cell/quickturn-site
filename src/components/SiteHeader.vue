<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { site } from "~~/content/site";
import { useSignupCta } from "~/composables/useSignupTarget";

/**
 * Sticky header. Transparent over the hero, then firms up into a frosted bar
 * once the page scrolls, so it never competes with the headline.
 */

const { goToSignup } = useSignupCta();

/** Past this many pixels the bar gets its background and bottom border. */
const SCROLL_THRESHOLD = 12;

const scrolled = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > SCROLL_THRESHOLD;
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  // The page can load already scrolled — a refresh, or a back navigation.
  onScroll();
});

onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header class="top" :class="{ scrolled }">
    <div class="wrap">
      <a class="mark" href="#" :aria-label="site.brand.homeAriaLabel">
        {{ site.brand.name }}
      </a>

      <a
        class="btn btn--small"
        href="#signup"
        @click.prevent="goToSignup('header')"
      >
        {{ site.nav.ctaLabel }}
      </a>
    </div>
  </header>
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition:
    background 0.3s,
    border-color 0.3s;
}

.top.scrolled {
  background: rgba(246, 245, 242, 0.82);
  border-bottom-color: rgba(211, 208, 201, 0.7);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  backdrop-filter: saturate(160%) blur(14px);
}

.wrap {
  max-width: var(--col-wide);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
}

.mark {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--brown);
  font-weight: 750;
  font-stretch: 112%;
  font-size: 22px;
  letter-spacing: -0.01em;
}

/* On the narrowest phones the headline needs the whole width. */
@media (max-width: 420px) {
  .btn--small {
    display: none;
  }
}
</style>
