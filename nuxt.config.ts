// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@vesp/nuxt-fontawesome",
    "@nuxtjs/eslint-module",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
  ],
  fontawesome: {
    icons: {
      solid: [
        "dollar-sign",
        "cog",
        "circle",
        "check",
        "calendar",
        "table",
        "code",
        "list",
        "copy",
        "times",
        "check-square",
      ],
      regular: ["user"],
    },
  },
  vite: {
    build: {
      target: "esnext",
    },
    optimizeDeps: {
      exclude: ["@rustwasm/smart-editor"],
    },
  },
  webpack: {
    experiments: {
      asyncWebAssembly: true,
      layers: true,
    },
  },
});
