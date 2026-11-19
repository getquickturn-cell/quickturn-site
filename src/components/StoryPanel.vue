<script setup lang="ts">
/**
 * One screen of the scroll story: a rounded panel holding a caption and one
 * piece of evidence.
 *
 * Four sections share this shape, so the panel owns the chrome and each
 * section supplies only its own content. The caption is a prop rather than a
 * slot because the dark variant has to restyle it, and scoped CSS cannot
 * reach into slotted markup.
 */

withDefaults(
  defineProps<{
    /** The line above the evidence. */
    caption: string;
    /** Which surface this panel sits on. */
    variant: "paper" | "dark" | "glow";
    /** Anchor id, when something links to this screen. */
    id?: string;
    /** Wider column, for the demo video. */
    wide?: boolean;
  }>(),
  { id: undefined, wide: false },
);
</script>

<template>
  <section :id="id" class="screen tile">
    <div class="wrap" :class="{ 'wrap--wide': wide }">
      <div class="panel" :class="`panel--${variant}`">
        <p v-reveal class="caption reveal">{{ caption }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Panels sit closer together than full screens — the panel's own padding
   already separates its contents from the next one. */
.tile {
  padding: 8px 0;
}

.wrap--wide {
  max-width: var(--col-demo);
}

.panel {
  border-radius: var(--radius-panel);
  padding: 40px 22px 48px;
  overflow: hidden;
}

.panel--paper {
  background: var(--panel-paper);
}

.panel--dark {
  background: var(--panel-dark);
}

.panel--dark .caption {
  color: var(--paper);
}

/* Lit from the top right and the bottom left, so the invoice on top of it
   reads as the bright thing on the page. */
.panel--glow {
  background:
    radial-gradient(60% 55% at 85% 15%, rgba(181, 96, 63, 0.32), transparent 70%),
    radial-gradient(55% 50% at 10% 90%, rgba(208, 138, 108, 0.3), transparent 70%),
    var(--panel-glow-base);
}
</style>
