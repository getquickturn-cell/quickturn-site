<script setup lang="ts">
import { site } from "~~/content/site";

/**
 * The whole thing, start to finish.
 *
 * Two encodes of the same demo: a vertical cut for phones and a wide one for
 * everything else. The browser picks from the `media` attributes, so a
 * mechanic on a phone never downloads the desktop file.
 */

const copy = site.demo;
</script>

<template>
  <figure v-reveal class="demo reveal">
    <video
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      :poster="copy.posterWide"
      :aria-label="copy.ariaLabel"
    >
      <source
        :src="copy.sourceVertical"
        type="video/mp4"
        media="(max-width: 640px)"
      />
      <source :src="copy.sourceWide" type="video/mp4" />
    </video>

    <figcaption>{{ copy.figcaption }}</figcaption>
  </figure>
</template>

<style scoped>
.demo {
  margin: 0;
}

video {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  /* Matches the demo footage's own background, so there is no flash of a
     different colour before the first frame paints. */
  background: #16233f;
  box-shadow: 0 24px 40px -24px rgba(0, 0, 0, 0.8);
}

figcaption {
  margin-top: 12px;
  font-size: 14px;
  color: var(--ink-on-dark-dim);
  text-align: center;
}

/* The vertical cut would otherwise stretch to the full panel width. */
@media (max-width: 640px) {
  .demo {
    max-width: 340px;
    margin: 0 auto;
  }
}
</style>
