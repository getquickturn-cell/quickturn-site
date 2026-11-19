<script setup lang="ts">
import { onMounted, ref } from "vue";
import { site } from "~~/content/site";
import SignupForm from "~/components/SignupForm.vue";
import { useSignupRegistration } from "~/composables/useSignupTarget";

/**
 * The close: three steps, then the form.
 *
 * This section registers itself as the target for every "Try it free" button
 * on the page, so a click from the header or the hero lands here with the
 * cursor already in the first field.
 */

const steps = site.steps;
const copy = site.signup;

const wrapEl = ref<HTMLDivElement | null>(null);
const form = ref<InstanceType<typeof SignupForm> | null>(null);

const { register } = useSignupRegistration();

/**
 * Show this section immediately, cancelling the scroll-in fade. Without
 * this, a visitor who clicks "Try it free" before ever scrolling down
 * arrives at a panel that is still at zero opacity.
 */
function revealNow() {
  const element = wrapEl.value;
  if (!element || element.classList.contains("in")) return;

  element.style.transition = "none";
  element.classList.add("in");
}

onMounted(() => {
  register({
    focusFirstField: () => form.value?.focusFirstField(),
    revealNow,
  });
});
</script>

<template>
  <section id="beta" class="screen close">
    <div ref="wrapEl" v-reveal class="wrap reveal">
      <h2>
        {{ steps.headline }}
        <span class="soft">{{ steps.headlineAccent }}</span>
      </h2>

      <ol class="steps">
        <li v-for="step in steps.items" :key="step.verb">
          <span><b>{{ step.verb }}</b> {{ step.rest }}</span>
        </li>
      </ol>

      <SignupForm ref="form" />

      <p class="fine">
        <template v-for="(line, index) in copy.fine" :key="line">
          <br v-if="index > 0" />
          {{ line }}
        </template>
      </p>

      <p class="fine">
        {{ copy.textCta.before
        }}<a :href="copy.textCta.smsHref">{{ copy.textCta.number }}</a
        >{{ copy.textCta.after }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.close {
  padding-top: 56px;
  padding-bottom: 64px;
}

.wrap {
  /* Wider gutters than the panel screens, matching the hero. */
  padding: 0 24px;
}

h2 {
  font-stretch: 112%;
  font-weight: 800;
  font-size: clamp(32px, 6vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 28px;
}

/* Numbered by CSS so the markup carries no hard-coded step numbers. */
.steps {
  list-style: none;
  padding: 0;
  margin: 0 0 36px;
  counter-reset: step;
}

.steps li {
  counter-increment: step;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 21px;
  margin-bottom: 16px;
}

.steps li::before {
  content: counter(step);
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--charcoal);
  font-weight: 800;
  font-size: 19px;
  background: var(--cream);
}

.steps b {
  font-weight: 800;
}

.fine {
  font-size: 15px;
  color: var(--muted);
  margin: 14px 0 0;
}

@media (max-width: 420px) {
  .steps li {
    font-size: 19px;
  }
}
</style>
