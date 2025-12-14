// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/i18n", "@nuxt/icon"],
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#06b6d4' },
        { name: 'theme-color', content: '#0b1f24', media: '(prefers-color-scheme: dark)' }
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/Binimoy Fav Icon.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
      ],
    },
  },
  i18n: {
    baseUrl: "https://binimoyweb.vercel.app",
    strategy: "prefix_except_default",
    defaultLocale: "en",
    locales: [
      {
        code: "en",
        language: "en-US",
        file: "en.json",
        name: "English",
        isCatchallLocale: true,
      },
      {
        code: "bn",
        language: "bn-BD",
        file: "bn.json",
        name: "বাংলা",
      },
      {
        code: "de",
        language: "de-DE",
        file: "de.json",
        name: "Deutsch",
      },
      {
        code: "km",
        language: "km-KH",
        file: "km.json",
        name: "ភាសាខ្មែរ",
      },
      {
        code: "ko",
        language: "ko-KR",
        file: "ko.json",
        name: "한국어",
      },
      {
        code: "tr",
        language: "tr-TR",
        file: "tr.json",
        name: "Türkçe",
      },
    ],
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },
});
