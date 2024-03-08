// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@jakguru/vueprint/dist/bootstraps/nuxt'],
  vueprint: {
    bus: {
      // ...
    },
    ls: {
      // ...
    },
    vuetify: {
      // ...
    },
    api: {
      // ...
    },
    identity: {
      // ...
    },
    push: {
      // ...
    },
  },
})
