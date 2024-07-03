import { createApp } from 'vue'
// @ts-ignore - this actually works
import VueMainBootstrap from '@jakguru/vueprint/plugins/main'
// @ts-ignore - this actually works
import VueClientBootstrap from '@jakguru/vueprint/plugins/client'
import '@jakguru/vueprint/vueprint.scss'
import App from './App.vue'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import 'sweetalert2/src/sweetalert2.scss'

import type { VueMainBootstrapOptions, VueClientBootstrapOptions } from '@jakguru/vueprint/plugins'

const vueprintMainPluginOptions: VueMainBootstrapOptions = {
  vuetify: {
    defaultTheme: 'vueprint',
    themes: {
      vueprint: {
        dark: true,
        colors: {
          accent: '#FFFFFF',
          background: '#04082b',
          cancel: '#f44336',
          error: '#EF9A9A',
          highlight: '#e67e7e',
          info: '#8bb4e7',
          notify: '#F6AD01',
          primary: '#0684c2',
          question: '#3174F1',
          secondary: '#13aab9',
          success: '#29D967',
          surface: '#000622',
          warning: '#f3cc31',
        },
      },
    },
    options: {
      components: vuetifyComponents,
      directives: vuetifyDirectives,
    },
  },
}

const vueprintClientPluginOptions: VueClientBootstrapOptions = {
  // Configuration for the Client plugin
  push: {
    firebaseOptions: {
      apiKey: 'AIzaSyD2Sae2shhrOHh_EwsyRxTa4Kg9QLMsZ_s',
      authDomain: 'vueprint-development.firebaseapp.com',
      projectId: 'vueprint-development',
      storageBucket: 'vueprint-development.appspot.com',
      messagingSenderId: '583302108349',
      appId: '1:583302108349:web:51c168ac2bfefa22be13d4',
    },
    serviceWorkerMode: 'module',
    serviceWorkerPath: '/dev-sw.js?dev-sw',
  },
}

const app = createApp(App)
app.use(VueMainBootstrap, vueprintMainPluginOptions)
app.use(VueClientBootstrap, vueprintClientPluginOptions)
app.mount('#app')
