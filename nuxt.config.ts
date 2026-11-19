// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-11-18",

  /**
   * Nuxt 4 defaults its source directory to `app/`, but in this repo `app/`
   * is the legacy mechanic app that is live at getquickturn.com/app/ and is
   * still used by the pilot. Vue source therefore lives in `src/`, and the
   * legacy app is served verbatim from `public/app/`.
   */
  srcDir: "src",

  /**
   * Prerendered static HTML, not a single-page app. This is a marketing
   * site: it has to be crawlable, and it has to paint fast on a phone with
   * one bar of signal in a truck. `nuxt generate` writes plain HTML files
   * that GitHub Pages serves directly.
   */
  ssr: true,

  nitro: {
    prerender: {
      // Only the landing page is a Vue route so far. /privacy/, /terms/ and
      // /text/ are still their original hand-written HTML, served verbatim
      // from public/ — converting them is a follow-up, and keeping them as
      // files means they cannot break while that happens.
      routes: ["/"],
      // Nothing links to an unlisted route yet; enable when more pages land.
      crawlLinks: false,
    },
  },

  experimental: {
    // No client-side payload files needed for a fully static marketing site.
    payloadExtraction: false,
  },

  css: [
    "~/assets/css/tokens.css",
    "~/assets/css/base.css",
    "~/assets/css/motion.css",
  ],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=Gochi+Hand&display=swap",
        },
      ],
      script: [
        // Google Analytics. Loaded exactly as the original page loaded it so
        // the existing property keeps receiving traffic uninterrupted.
        {
          async: true,
          src: "https://www.googletagmanager.com/gtag/js?id=G-SDN8X72FWK",
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-SDN8X72FWK');`,
        },
      ],
    },
  },

  // `~~/content/site.ts` holds all site copy; `~~` is the project root.
  alias: {},

  typescript: {
    strict: true,
    typeCheck: false,
  },

  devtools: { enabled: true },
});
