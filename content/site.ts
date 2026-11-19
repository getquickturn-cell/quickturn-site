/**
 * All site copy, in one place.
 *
 * Danny owns the words on this site. Everything a visitor reads lives in
 * this file so changing a headline, a FAQ answer, or the phone number never
 * means opening a Vue component — edit the string, commit, done.
 *
 * Two rules:
 *  - Copy belongs here. Markup and styling belong in `components/`.
 *  - The IDs under `signupForm` are live integration points. Changing them
 *    silently breaks lead capture, so leave them alone unless you are
 *    deliberately pointing the form somewhere new.
 */

export const site = {
  meta: {
    title: "QuickTurn: invoicing for mobile diesel mechanics",
    description:
      "QuickTurn turns what you say after a road call into a finished invoice. Built for mobile diesel mechanics. Try it free.",
    /** Google Analytics measurement ID. */
    gaMeasurementId: "G-SDN8X72FWK",
  },

  brand: {
    name: "QuickTurn",
    homeAriaLabel: "QuickTurn home",
  },

  nav: {
    ctaLabel: "Try it free",
  },

  hero: {
    tag: "Built for mobile diesel mechanics",
    /** Rendered as one headline; `accent` is the brown half. */
    headline: "Stop doing invoices",
    headlineAccent: "at the kitchen table.",
    lead: "Talk through the job. Get the invoice.",
    ctaLabel: "Try it free",
    note: "No card needed. We'll set it up with you in 10 minutes.",
    scrollCue: "See how it works",
  },

  /** The handwritten job note. */
  before: {
    caption: "Hours get lost on scraps like this.",
    /** Each entry is one handwritten line. */
    lines: ["Ridgeline #214", "Cascadia, turbo actuator", "regen, 3.5 hr?? + road call"],
    /** Read aloud by screen readers in place of the image. */
    ariaLabel:
      "A handwritten job note: Ridgeline Freight number 214, Cascadia, turbo actuator, regen, 3.5 hours with question marks, plus road call",
  },

  /** The voice note from the truck. */
  voice: {
    caption: "Just talk through the job from your truck.",
    speaker: "Voice note from the service truck",
    quote:
      "“Ridgeline Freight, unit 214. Replaced the turbo actuator, ran a forced regen. Three and a half hours plus the road call. PO 5531.”",
  },

  /** The finished invoice. */
  payoff: {
    caption: "Every hour billed. Done before you pull out.",
    invoiceNumber: "Invoice #1042",
    customer: "Ridgeline Freight, Unit 214",
    lines: [
      { label: "Turbo actuator", amount: "$865.00" },
      { label: "Road call", amount: "$150.00" },
      { label: "Labor, 3.5 hrs", amount: "$507.50", highlight: true },
    ],
    total: { label: "Total (PO 5531)", amount: "$1,522.50" },
    status: "Ready for you to check and send",
  },

  demo: {
    caption: "Watch it happen, start to finish.",
    figcaption: "Early preview of the QuickTurn beta.",
    posterWide: "/media/quickturn-demo-wide.jpg",
    sourceVertical: "/media/quickturn-demo-vertical.mp4",
    sourceWide: "/media/quickturn-demo-wide.mp4",
    ariaLabel:
      "Demo: a mechanic texts the job, a voice note and a receipt photo, and QuickTurn AI turns it into an invoice with a pay link.",
  },

  steps: {
    headline: "Three steps.",
    headlineAccent: "That's it.",
    items: [
      { verb: "Talk", rest: "about the job" },
      { verb: "Check", rest: "the invoice" },
      { verb: "Send", rest: "it and get paid" },
    ],
  },

  signup: {
    heading: "Try it free",
    sub: "Takes 30 seconds. We'll text you to get set up.",
    nameLabel: "Your name",
    phoneLabel: "Phone number",
    phonePlaceholder: "801-555-0123",
    workLegend: "What kind of work do you mostly do?",
    workOptions: [
      "Diesel / semi trucks",
      "Fleet vehicles",
      "Heavy equipment",
      "Cars and light trucks",
    ],
    otherOptionLabel: "Something else",
    otherFieldLabel: "What kind of work?",
    otherPlaceholder: "Tell us what you work on",
    submitLabel: "Try it free",
    submittingLabel: "Sending…",
    thanksHeading: "You're in.",
    thanksBody: "We'll text you soon to get QuickTurn set up.",
    errors: {
      missingName: "Add your name so we know who to text.",
      badPhone: "Add a phone number we can text, with area code.",
      missingWork: "Pick the kind of work you mostly do.",
      missingOther: "Tell us what kind of work you do.",
      /** `{link}` is replaced with a link to the Google Form itself. */
      sendFailed: "That didn’t go through. Check your connection, or {link} instead.",
      sendFailedLinkLabel: "sign up here",
    },
    fine: [
      "Free while we build it. No card. We'll set it up with you in 10 minutes.",
      "All we ask: use it on real jobs and give us some feedback!",
    ],
    textCta: {
      before: "Or text TRY to ",
      number: "801-995-3665",
      smsHref: "sms:+18019953665?&body=TRY",
      after: " and we will reach out.",
    },
  },

  /**
   * Live integration. These IDs point at the Google Form that collects
   * leads; responses land in the same sheet the site has always used.
   */
  signupForm: {
    formId: "1FAIpQLSe_pJ582UFbhhoA04wk8T_OfUpHU44mtJqO6i6vG0-fwETcfg",
    entries: {
      name: "entry.658159335",
      phone: "entry.1613072008",
      work: "entry.1036059815",
    },
    /** Google's sentinel for "the other option was chosen". */
    otherSentinel: "__other_option__",
  },

  founderStory: {
    quote: "My dad ran his whole diesel business off pen and paper.",
    body: "I'm Aaron, one of QuickTurn's co-founders. I watched my dad lose hours every day to notebooks and receipts instead of fixing trucks. QuickTurn is the tool I wish he'd had, and we're building it with real mechanics.",
  },

  faq: {
    heading: "Questions",
    items: [
      {
        question: "How much will it cost?",
        answer:
          "It's free while we build it. The first mechanics on QuickTurn get our best launch price.",
      },
      {
        question: "Does it work with QuickBooks?",
        answer:
          "That's one of the first things we're building, so your invoices get into QuickBooks without retyping.",
      },
      {
        question: "I mostly work on fleet trucks. Will it handle that?",
        answer:
          "Yes. Unit numbers, PO numbers, and each truck's repair history are built in.",
      },
      {
        question: "I'm not great with technology. Is that a problem?",
        answer:
          "No. That's who we're building it for. If it isn't simple, that's on us, and we'll set it up with you.",
      },
    ],
  },

  footer: {
    copyright: "© 2026 QuickTurn LLC, Provo, Utah",
    email: "getquickturn@gmail.com",
    links: [
      { label: "Privacy Policy", href: "/privacy/" },
      { label: "Terms of Service", href: "/terms/" },
      { label: "Text your jobs: (385) 438-8995", href: "/text/" },
    ],
  },
} as const;

export type Site = typeof site;
