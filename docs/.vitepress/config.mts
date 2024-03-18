import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vueprint/',
  lang: 'en-US',
  title: "VuePrint",
  description: "A BluePrint for Vue 3 Projects providing much of the desired functionality in a consistent and easily configurable manner",
  head: [
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/favicons/apple-touch-icon-57x57.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/favicons/apple-touch-icon-60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/favicons/apple-touch-icon-72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/favicons/apple-touch-icon-76x76.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/favicons/apple-touch-icon-114x114.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/favicons/apple-touch-icon-120x120.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/favicons/apple-touch-icon-144x144.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicons/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/apple-touch-icon-180x180.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicons/android-chrome-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/favicons/site.webmanifest' }],
    ['link', { rel: 'mask-icon', href: '/favicons/safari-pinned-tab.svg', color: '#227fb9' }],
    ['meta', { name: 'msapplication-TileColor', content: '#227fb9' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
  ],
  themeConfig: {
    logo: '/icon.jpg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Usage', link: '/getting-started/' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started/' },
          { text: 'Styling', link: '/getting-started/styles' },
          { text: 'Typescript Augmentations', link: '/getting-started/typescript-augmentations' },
          { text: 'Configuration', link: '/getting-started/configuration' },
        ],
        collapsed: true,
      },
      {
        text: 'What\'s Included',
        items: [
          { text: 'What\'s Included', link: '/whats-included/' },
          {text: "The API Service", link: "/whats-included/api-service" },
          {text: "The Bus Service", link: "/whats-included/bus-service" },
          {text: "The Cron Service", link: "/whats-included/cron-service" },
          {text: "The Identity Service", link: "/whats-included/identity-service" },
          {text: "The Local Storage Service", link: "/whats-included/local-storage-service" },
          {text: "The Push Service", link: "/whats-included/push-service" },
          {text: "The UI Service", link: "/whats-included/ui-service" },
          {text: "The Vuetify Service", link: "/whats-included/vuetify-service" },
          {text: "Color Utilities", link: "/api/modules/utilities_colors" },
          {text: "Debug Utilities", link: "/api/modules/utilities_debug" },
          {text: "Validation Utilities", link: "/api/modules/utilities_validation" },
          {text: "Service Worker Provider", link: "/whats-included/service-worker-provider" },
        ],
        collapsed: true,
      },
      { text: 'Full API', link: '/api/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jakguru/vueprint' }
    ],

    search: {
      provider: 'local'
    }
  }
})
