<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { site } from "~~/content/site";
import { trackEvent } from "~/utils/analytics";

/**
 * Beta signup. Posts to the same Google Form the site has always used, so
 * leads keep landing in the existing sheet — the entry IDs in
 * `content/site.ts` are the live contract and must not drift.
 *
 * Submission is `mode: "no-cors"`, which means the browser never lets us
 * read the response. A resolved fetch therefore means "the request left the
 * machine", not "Google accepted it". That is the same bargain the original
 * page made; the fallback link on failure is what covers the difference.
 */

const copy = site.signup;
const config = site.signupForm;

const FORM_POST = `https://docs.google.com/forms/d/e/${config.formId}/formResponse`;
const FORM_PAGE = `https://docs.google.com/forms/d/e/${config.formId}/viewform`;

/** Sentinel for the "Something else" radio, kept out of the posted value. */
const OTHER = "__other__";

const name = ref("");
const phone = ref("");
const work = ref("");
const otherWork = ref("");

const submitting = ref(false);
const submitted = ref(false);
const error = ref("");
/** Set when the post failed, so we can offer the Google Form as a fallback. */
const showFallbackLink = ref(false);

const nameField = ref<HTMLInputElement | null>(null);
const phoneField = ref<HTMLInputElement | null>(null);
const otherField = ref<HTMLInputElement | null>(null);
const thanksPanel = ref<HTMLDivElement | null>(null);

const wantsOther = computed(() => work.value === OTHER);

/** Expose the name field so the page's "Try it free" buttons can focus it. */
function focusFirstField() {
  nameField.value?.focus({ preventScroll: true });
}
defineExpose({ focusFirstField });

function clearError() {
  error.value = "";
  showFallbackLink.value = false;
}

/**
 * Validate in the order a person reads the form, focusing the first field
 * that needs attention. Returns null when everything is in order.
 */
function findProblem(): { message: string; focus?: HTMLInputElement | null } | null {
  if (!name.value.trim()) {
    return { message: copy.errors.missingName, focus: nameField.value };
  }
  if (phone.value.replace(/\D/g, "").length < 10) {
    return { message: copy.errors.badPhone, focus: phoneField.value };
  }
  if (!work.value) {
    return { message: copy.errors.missingWork };
  }
  if (wantsOther.value && !otherWork.value.trim()) {
    return { message: copy.errors.missingOther, focus: otherField.value };
  }
  return null;
}

function buildPayload(): URLSearchParams {
  const payload = new URLSearchParams();
  payload.append(config.entries.name, name.value.trim());
  payload.append(config.entries.phone, phone.value.trim());

  if (wantsOther.value) {
    // Google expects its own sentinel plus a sibling field for the text.
    payload.append(config.entries.work, config.otherSentinel);
    payload.append(
      `${config.entries.work}.other_option_response`,
      otherWork.value.trim(),
    );
  } else {
    payload.append(config.entries.work, work.value);
  }

  return payload;
}

async function onSubmit() {
  clearError();

  const problem = findProblem();
  if (problem) {
    error.value = problem.message;
    problem.focus?.focus();
    return;
  }

  submitting.value = true;

  try {
    await fetch(FORM_POST, {
      method: "POST",
      mode: "no-cors",
      body: buildPayload(),
    });

    trackEvent("generate_lead", { method: "signup_form" });
    submitted.value = true;
    // Move focus to the confirmation so screen-reader users hear it.
    await nextTick();
    thanksPanel.value?.focus();
  } catch {
    error.value = copy.errors.sendFailed;
    showFallbackLink.value = true;
  } finally {
    submitting.value = false;
  }
}

/** Split the failure message around its `{link}` placeholder. */
const fallbackParts = computed(() => copy.errors.sendFailed.split("{link}"));
</script>

<template>
  <form id="signup" class="signup" novalidate @submit.prevent="onSubmit">
    <div v-if="!submitted">
      <h3>{{ copy.heading }}</h3>
      <p class="sub">{{ copy.sub }}</p>

      <div class="field">
        <label for="su-name">{{ copy.nameLabel }}</label>
        <input
          id="su-name"
          ref="nameField"
          v-model="name"
          type="text"
          autocomplete="name"
          @input="clearError"
        />
      </div>

      <div class="field">
        <label for="su-phone">{{ copy.phoneLabel }}</label>
        <input
          id="su-phone"
          ref="phoneField"
          v-model="phone"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          :placeholder="copy.phonePlaceholder"
          @input="clearError"
        />
      </div>

      <fieldset class="field">
        <legend>{{ copy.workLegend }}</legend>
        <div class="pills">
          <label v-for="option in copy.workOptions" :key="option">
            <input
              v-model="work"
              type="radio"
              name="work"
              :value="option"
              @change="clearError"
            />
            <span>{{ option }}</span>
          </label>
          <label>
            <input
              v-model="work"
              type="radio"
              name="work"
              :value="OTHER"
              @change="clearError"
            />
            <span>{{ copy.otherOptionLabel }}</span>
          </label>
        </div>

        <div v-if="wantsOther" class="other-wrap">
          <label for="other-work" class="sr-only">{{ copy.otherFieldLabel }}</label>
          <input
            id="other-work"
            ref="otherField"
            v-model="otherWork"
            type="text"
            :placeholder="copy.otherPlaceholder"
            @input="clearError"
          />
        </div>
      </fieldset>

      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? copy.submittingLabel : copy.submitLabel }}
      </button>

      <p class="form-error" role="alert">
        <template v-if="error && showFallbackLink">
          {{ fallbackParts[0]
          }}<a :href="FORM_PAGE" target="_blank" rel="noopener">{{
            copy.errors.sendFailedLinkLabel
          }}</a
          >{{ fallbackParts[1] }}
        </template>
        <template v-else>{{ error }}</template>
      </p>
    </div>

    <div v-else ref="thanksPanel" class="thanks" tabindex="-1">
      <div class="check" aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h3>{{ copy.thanksHeading }}</h3>
      <p>{{ copy.thanksBody }}</p>
    </div>
  </form>
</template>

<style scoped>
.signup {
  scroll-margin-top: 84px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 26px 22px 24px;
  box-shadow: 0 24px 44px -28px rgba(34, 38, 43, 0.35);
}

h3 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 800;
  font-stretch: 108%;
}

.sub {
  margin: 0 0 18px;
  font-size: 15px;
  color: var(--muted);
}

.field {
  margin-bottom: 16px;
}

.field label,
.field legend {
  display: block;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
  padding: 0;
}

.field input[type="text"],
.field input[type="tel"] {
  width: 100%;
  font: inherit;
  font-size: 17px;
  color: var(--charcoal);
  padding: 13px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper);
}

.field input:focus {
  outline: none;
  border-color: var(--brown);
  box-shadow: 0 0 0 3px rgba(181, 96, 63, 0.18);
  background: #fff;
}

fieldset.field {
  border: 0;
  margin: 0 0 16px;
  padding: 0;
  min-width: 0;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pills label {
  margin: 0;
  display: inline-flex;
  align-items: center;
  /* 44px is the minimum comfortable touch target — these get tapped with
     work gloves on, in a truck. */
  min-height: 44px;
  padding: 0 16px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--paper);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.pills input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.pills label:has(input:checked) {
  background: var(--brown);
  border-color: var(--brown);
  color: #fff;
}

.pills label:has(input:focus-visible) {
  outline: 3px solid var(--amber);
  outline-offset: 2px;
}

.other-wrap {
  margin-top: 10px;
}

.btn {
  width: 100%;
  border: 0;
  margin-top: 4px;
}

.form-error {
  color: var(--error);
  font-size: 15px;
  font-weight: 600;
  margin: 10px 0 0;
  /* Reserve a line so the layout does not jump when a message appears. */
  min-height: 1px;
}

.thanks {
  text-align: center;
  padding: 18px 6px 8px;
}

.thanks .check {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--brown);
  color: #fff;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}

.thanks h3 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 800;
}

.thanks p {
  margin: 0;
  color: var(--oil);
}
</style>
