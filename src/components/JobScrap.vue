<script setup lang="ts">
import { site } from "~~/content/site";

/** The before: a handwritten job note, the way hours get lost today. */

const copy = site.before;
</script>

<template>
  <div v-reveal class="scrap reveal" :aria-label="copy.ariaLabel">
    <span class="smudge" aria-hidden="true" />
    <span v-for="line in copy.lines" :key="line" class="line">{{ line }}</span>
  </div>
</template>

<style scoped>
.scrap {
  position: relative;
  max-width: 380px;
  margin: 0 auto;
  background-color: var(--scrap);
  padding: 22px 22px 26px;
  border-radius: 2px;
  transform: rotate(-3deg);
  box-shadow:
    0 1px 0 var(--line),
    0 14px 30px -18px rgba(34, 38, 43, 0.35);
  /* Ruled paper. The 32px stripe matches the line-height below, so the
     handwriting sits on the lines instead of across them. */
  background-image: repeating-linear-gradient(
    transparent 0 31px,
    var(--line) 31px 32px
  );
  font-family: var(--font-hand);
  font-size: 24px;
  line-height: 32px;
  color: #2c3a55;
}

/* Each note line is its own block so it keeps the 32px rhythm. */
.line {
  display: block;
}

/* A thumbprint of grease, because this note lived in a truck. */
.smudge {
  position: absolute;
  right: 18px;
  top: 14px;
  width: 46px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(rgba(58, 53, 47, 0.22), transparent 70%);
}
</style>
