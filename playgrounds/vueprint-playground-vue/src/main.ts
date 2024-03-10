import { createApp } from 'vue'
import App from './App.vue'
import VueMainBootstrap from '@jakguru/vueprint/plugins/main'
import VueClientBootstrap from '@jakguru/vueprint/plugins/client'
import type {
  BusPluginOptions,
  LocalStoragePluginOptions,
  VuetifyPluginOptions,
  ApiPluginOptions,
  PushPluginOptions,
  IdentityPluginOptions,
  VueMainBootstrapOptions,
  VueClientBootstrapOptions,
} from '@jakguru/vueprint/plugins'

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

const vueprintMainPluginOptions: VueMainBootstrapOptions = {
  bus: busPluginOptions,
  ls: localStoragePluginOptions,
  vuetify: vuetifyPluginOptions,
  api: apiPluginOptions,
  identity: identityPluginOptions,
}

const vueprintClientPluginOptions: VueClientBootstrapOptions = {
  push: pushPluginOptions,
}

const app = createApp(App)
app.use(VueMainBootstrap, vueprintMainPluginOptions)
app.use(VueClientBootstrap, vueprintClientPluginOptions)
app.mount('#app')
