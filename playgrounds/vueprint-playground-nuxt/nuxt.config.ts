// https://nuxt.com/docs/api/configuration/nuxt-config
import { vueprintModuleOptions } from '../configurations'
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@jakguru/vueprint/dist/bootstraps/nuxt'],
  vueprint: vueprintModuleOptions,
})
