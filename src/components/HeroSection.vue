<script setup lang="ts">
import { site } from "~~/content/site";
import { useSignupCta } from "~/composables/useSignupTarget";

/** The hook: one headline, one promise, one button. */

const copy = site.hero;
const { goToSignup } = useSignupCta();
</script>

<template>
  <section class="screen hero">
    <div class="wrap">
      <span class="tag">{{ copy.tag }}</span>

      <h1>
        {{ copy.headline }}
        <span class="soft">{{ copy.headlineAccent }}</span>
      </h1>

      <p class="lead">{{ copy.lead }}</p>

      <a class="btn" href="#signup" @click.prevent="goToSignup('hero')">
        {{ copy.ctaLabel }}
      </a>

      <p class="note">{{ copy.note }}</p>

      <a class="more" href="#before" :aria-label="copy.scrollCue">
        {{ copy.scrollCue }}
        <span aria-hidden="true">&#8964;</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 48px 0 28px;
}

/* Warm glow in the bottom-left, mirroring the one behind the page top. */
.hero::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
  width: 420px;
  height: 420px;
  left: -220px;
  bottom: -160px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(181, 96, 63, 0.16) 0%,
    transparent 65%
  );
}

.wrap {
  position: relative;
  /* Wider gutters than the panel sections below: nothing boxes this in. */
  padding: 0 24px;
}

.tag {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--brown-deep);
  background: var(--cream);
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  margin-bottom: 20px;
}

h1 {
  font-stretch: 118%;
  font-weight: 800;
  font-size: clamp(42px, 9vw, 68px);
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0 0 20px;
}

.lead {
  font-size: 22px;
  color: var(--oil);
  margin: 0 0 30px;
}

.note {
  font-size: 15px;
  color: var(--muted);
  margin: 14px 0 0;
}

.more {
  display: block;
  text-align: center;
  margin-top: 36px;
  color: var(--muted);
  font-size: 15px;
  text-decoration: none;
}

.more span {
  display: block;
  font-size: 26px;
  line-height: 1;
}

@media (max-width: 420px) {
  .lead {
    font-size: 20px;
  }
}
</style>
