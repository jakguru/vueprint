import type { App } from 'vue'
import type { VuetifiableThemes } from 'src/vuetify'
export type { VuetifiableTheme, VuetifiableColors } from 'src/vuetify'
import type { VuetifyOptions } from 'vuetify'
import { initializeVuetify } from 'src/vuetify'

export { VuetifiableThemes }

/**
 * The options for the vuetify plugin
 */
export interface VuetifyPluginOptions {
  /**
   * The key of the themes object to use as the default theme
   */
  defaultTheme: string
  /**
   * An object containing the configuration of a theme
   */
  themes: VuetifiableThemes
  /**
   * The options to pass to the Vuetify instance
   */
  options: VuetifyOptions
}

/**
 * A wrapper plugin for the Vuetify UI framework
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
