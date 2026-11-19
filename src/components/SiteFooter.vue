<script setup lang="ts">
import { site } from "~~/content/site";

const footer = site.footer;
</script>

<template>
  <footer>
    <!--
      The copyright and each link are separate children on purpose: `.wrap`
      is a `space-between` flex row, so they spread across the footer rather
      than bunching up on the right. The separators are plain text, the way
      the original page wrote them.
    -->
    <div class="wrap">
      <span>{{ footer.copyright }}</span>

      <a :href="`mailto:${footer.email}`">{{ footer.email }}</a>

      <template v-for="link in footer.links" :key="link.href">
        &middot;
        <a :href="link.href">{{ link.label }}</a>
      </template>
    </div>
  </footer>
</template>

<style scoped>
footer {
  border-top: 1px solid var(--line);
  padding: 28px 0 40px;
  font-size: 15px;
  color: var(--muted);
}

.wrap {
  max-width: var(--col-wide);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
