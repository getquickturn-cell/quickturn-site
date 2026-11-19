<script setup lang="ts">
import { site } from "~~/content/site";
import { provideSignupTarget } from "~/composables/useSignupTarget";

/**
 * The site shell: header, page, footer.
 *
 * Everything that is the same on every page lives here. Page content lives
 * in `pages/`.
 */

// Shared by the header's "Try it free" button and the signup form itself.
provideSignupTarget();

useHead({
  title: site.meta.title,
  meta: [{ name: "description", content: site.meta.description }],
});
</script>

<template>
  <SiteHeader />

  <main>
    <NuxtPage />
  </main>

  <SiteFooter />
</template>

<style scoped>
/**
 * The hero's decorative glows are painted at `z-index: -1`, behind the page.
 * Giving main its own stacking context keeps them behind the content instead
 * of behind the page background, where they would vanish.
 */
main {
  position: relative;
  z-index: 0;
}
</style>
