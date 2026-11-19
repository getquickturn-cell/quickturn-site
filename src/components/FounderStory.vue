<script setup lang="ts">
import { site } from "~~/content/site";

/** Why this exists, in Aaron's words. */

const copy = site.founderStory;
</script>

<template>
  <section class="story">
    <div class="wrap">
      <blockquote>{{ copy.quote }}</blockquote>
      <p>{{ copy.body }}</p>
    </div>
  </section>
</template>

<style scoped>
.story {
  background: var(--charcoal);
  color: var(--paper);
  padding: 72px 0;
}

/* Handwritten, like the note at the top of the page. */
blockquote {
  margin: 0 0 20px;
  font-family: var(--font-hand);
  font-size: 32px;
  line-height: 1.2;
  color: var(--amber);
}

p {
  color: var(--ink-inverse);
  margin: 0;
}
</style>
