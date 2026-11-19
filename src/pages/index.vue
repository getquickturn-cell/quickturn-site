<script setup lang="ts">
import { site } from "~~/content/site";

/**
 * The landing page: one scroll story.
 *
 * Hook, then the problem, then the ask, then the payoff, then the proof,
 * then the form. Each screen holds exactly one idea — a mechanic reading
 * this is on a phone, often in a truck, and scrolls fast.
 *
 * Copy lives in `content/site.ts`. Nothing on this page is written here.
 */
</script>

<template>
  <HeroSection />

  <StoryPanel id="before" variant="paper" :caption="site.before.caption">
    <JobScrap />
  </StoryPanel>

  <StoryPanel variant="dark" :caption="site.voice.caption">
    <VoiceNote />
  </StoryPanel>

  <StoryPanel variant="glow" :caption="site.payoff.caption">
    <InvoicePreview />
  </StoryPanel>

  <StoryPanel id="demo" variant="dark" wide :caption="site.demo.caption">
    <DemoVideo />
  </StoryPanel>

  <BetaSection />

  <FounderStory />

  <FaqList />
</template>

<style scoped>
/**
 * The first panel needs a little more air under the hero than the panels
 * need between each other. Vue puts this component's scope id on each child
 * component's root element, so the sibling selector reaches across them.
 */
.hero + .tile {
  padding-top: 24px;
}
</style>
