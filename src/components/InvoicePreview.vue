<script setup lang="ts">
import { site } from "~~/content/site";

/** The payoff: the finished invoice, every hour on it. */

interface InvoiceLine {
  label: string;
  amount: string;
  /** Labor is the line mechanics lose money on, so it gets highlighted. */
  highlight?: boolean;
}

const copy = site.payoff;

/**
 * `content/site.ts` is `as const`, which types each line by its literal
 * values and leaves `highlight` off the lines that do not set it. Reading
 * them through one shape keeps the template from having to narrow a union.
 */
const lines = copy.lines as readonly InvoiceLine[];
</script>

<template>
  <div v-reveal class="invoice reveal">
    <header>
      <b>{{ copy.invoiceNumber }}</b>
      <span>{{ copy.customer }}</span>
    </header>

    <table>
      <tbody>
        <tr
          v-for="line in lines"
          :key="line.label"
          :class="{ labor: line.highlight }"
        >
          <td>{{ line.label }}</td>
          <td>{{ line.amount }}</td>
        </tr>
        <tr class="total">
          <td>{{ copy.total.label }}</td>
          <td>{{ copy.total.amount }}</td>
        </tr>
      </tbody>
    </table>

    <span class="status">{{ copy.status }}</span>
  </div>
</template>

<style scoped>
.invoice {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border: 2px solid var(--charcoal);
  border-radius: 12px;
  padding: 18px 20px;
  font-size: 16px;
  /* Softly lifted off the glow panel it sits on. The original stylesheet
     also gave `.invoice` a hard `8px 8px 0` offset block, but the more
     specific `.panel-glow .invoice` replaced the whole box-shadow property,
     so that offset never rendered on the live site. This is the shadow that
     actually shows. */
  box-shadow: 0 24px 44px -22px rgba(34, 38, 43, 0.35);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  border-bottom: 2px solid var(--charcoal);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

header b {
  font-stretch: 115%;
  font-size: 17px;
  white-space: nowrap;
}

header span {
  color: var(--muted);
  font-size: 13px;
  text-align: right;
}

table {
  width: 100%;
  border-collapse: collapse;
}

td {
  padding: 6px 0;
  border-bottom: 1px solid var(--line-soft);
}

/* Amounts line up on the decimal, like a real invoice. */
td:last-child {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

tr.labor td {
  background: #f6e3da;
  font-weight: 700;
}

tr.labor td:first-child {
  padding-left: 8px;
  border-left: 3px solid var(--brown);
}

tr.labor td:last-child {
  padding-right: 8px;
}

tr.total td {
  border-bottom: 0;
  font-weight: 800;
  font-size: 18px;
  padding-top: 10px;
}

.status {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brown-deep);
  background: var(--cream);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}
</style>
