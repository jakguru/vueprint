// https://nuxt.com/docs/api/configuration/nuxt-config
import type {
  BusPluginOptions,
  LocalStoragePluginOptions,
  VuetifyPluginOptions,
  ApiPluginOptions,
  PushPluginOptions,
  IdentityPluginOptions,
} from '@jakguru/vueprint/plugins'
import type { VueprintModuleOptions } from '@jakguru/vueprint/nuxt'

const busPluginOptions: BusPluginOptions = {
  namespace: 'vueprint',
}
const localStoragePluginOptions: LocalStoragePluginOptions = {
  namespace: 'vueprint',
}
const vuetifyPluginOptions: VuetifyPluginOptions = {
  defaultTheme: 'vueprint',
  themes: {
    vueprint: {
      dark: true,
      colors: {
        background: '#227fb9',
        surface: '#024180',
        primary: '#34495E',
        secondary: '#41B883',
        accent: '#676464',
        highlight: '#34495E',
        notify: '#E53935',
        success: '#06972E',
        info: '#3F51B5',
        warning: '#FFA000',
        error: '#E43333',
        question: '#554C7D',
        cancel: '#666666',
      },
    },
  },
}
const apiPluginOptions: ApiPluginOptions = {}
const pushPluginOptions: PushPluginOptions = {}
const identityPluginOptions: IdentityPluginOptions = {}

export const vueprintModuleOptions: VueprintModuleOptions = {
  bus: busPluginOptions,
  ls: localStoragePluginOptions,
  vuetify: vuetifyPluginOptions,
  api: apiPluginOptions,
  identity: identityPluginOptions,
  push: pushPluginOptions,
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@jakguru/vueprint/nuxt'],
  vueprint: vueprintModuleOptions,
})
