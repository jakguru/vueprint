import type { App } from 'vue'
import type { VuetifiableThemes } from 'src/vuetify'
import type { VuetifyOptions } from 'vuetify'
import { initializeVuetify } from 'src/vuetify'

/**
 * The options for the vuetify plugin
 * @group plugins
 */
export interface VuetifyPluginOptions {
  defaultTheme: string
  themes: VuetifiableThemes
  options: VuetifyOptions
}

/**
 * A wrapper plugin for the Vuetify UI framework
 * @group plugins
 */
export const VuetifyPlugin = {
  install: (app: App, options?: VuetifyPluginOptions) => {
    const defaultTheme = options?.defaultTheme || 'main'
    const themes = options?.themes || {
      main: {
        dark: false,
        colors: {
          background: '#e3e3e3',
          surface: '#eef0f0',
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
    }
    const opts = options?.options || {}
    const instance = initializeVuetify(defaultTheme, themes, opts)
    app.use(instance)
  },
}
