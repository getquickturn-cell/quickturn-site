<script setup lang="ts">
import { site } from "~~/content/site";

/** The four questions mechanics actually ask. */

const copy = site.faq;
</script>

<template>
  <section class="faq">
    <div class="wrap">
      <h2>{{ copy.heading }}</h2>
      <dl>
        <template v-for="item in copy.items" :key="item.question">
          <dt>{{ item.question }}</dt>
          <dd>{{ item.answer }}</dd>
        </template>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding: 72px 0;
}

h2 {
  font-stretch: 112%;
  font-weight: 800;
  font-size: 32px;
  margin: 0 0 4px;
}

dt {
  font-weight: 750;
  font-size: 19px;
  margin-top: 22px;
}

dd {
  margin: 6px 0 0;
  color: var(--oil);
}
</style>
