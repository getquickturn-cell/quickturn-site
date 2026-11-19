<script setup lang="ts">
import { site } from "~~/content/site";

/** The ask: talk through the job from the truck. */

const copy = site.voice;

/** Bars in the waveform. Five, animated on a stagger by motion.css. */
const WAVE_BARS = 5;
</script>

<template>
  <div v-reveal class="voice reveal">
    <div class="who">
      <span class="wave" aria-hidden="true">
        <i v-for="bar in WAVE_BARS" :key="bar" />
      </span>
      {{ copy.speaker }}
    </div>
    {{ copy.quote }}
  </div>
</template>

<style scoped>
.voice {
  max-width: 400px;
  margin: 0 auto;
  /* A shade lighter than the dark panel, with a rim, so it reads as a card
     sitting on the panel rather than a hole cut in it. */
  background: #2b3036;
  color: var(--paper);
  border: 1px solid var(--line-dark);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  font-size: 17px;
  line-height: 1.5;
  box-shadow: 0 24px 40px -24px rgba(0, 0, 0, 0.8);
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-on-dark-dim);
  margin-bottom: 8px;
}

.wave {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  height: 16px;
}

.wave i {
  width: 3px;
  height: 10px;
  background: var(--amber);
  border-radius: 2px;
  display: block;
}
</style>
