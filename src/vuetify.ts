import '@mdi/font/css/materialdesignicons.css'
import type { VuetifyOptions, ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import merge from 'lodash.merge'

let instance: ReturnType<typeof createVuetify> | undefined

/**
 * The colors which will be used by a Vuetify theme
 * @group ui
 */
export interface VuetifiableColors {
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  highlight: string
  notify: string
  success: string
  info: string
  warning: string
  error: string
  question: string
  cancel: string
  [key: string]: string
}

/**
 * A theme which will be used by a Vuetify instance
 * @group ui
 */
export interface VuetifiableTheme extends ThemeDefinition {
  colors: VuetifiableColors
}

/**
 * A collection of themes which will be used by a Vuetify instance
 * @group ui
 */
export interface VuetifiableThemes {
  [key: string]: VuetifiableTheme
}

/**
 * Initialize the Vuetify instance
 * @group ui
 * @private
 * @param defaultTheme The default theme to use
 * @param themes The themes to use
 * @param options The options to use
 * @returns The Vuetify instance
 */
export const initializeVuetify = (
  defaultTheme: string,
  themes: VuetifiableThemes,
  options: VuetifyOptions
) => {
  const allColorNames = new Set(Object.values(themes).flatMap((theme) => Object.keys(theme.colors)))
  const config: VuetifyOptions = merge({}, options, {
    theme: {
      defaultTheme,
      variations: {
        colors: Array.from(allColorNames),
        lighten: 5,
        darken: 5,
      },
      themes,
    },
  })
  const vuetify = createVuetify(config)
  return vuetify
}

/**
 * Retrieve the already initialized Vuetify instance
 * @group ui
 * @private
 * @returns The Vuetify instance
 */
export const getInstance = () => {
  if (!instance) {
    throw new Error('Vuetify instance has not been initialized yet')
  }
  return instance
}
