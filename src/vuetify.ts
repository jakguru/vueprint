import '@mdi/font/css/materialdesignicons.css'
import type { VuetifyOptions, ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import merge from 'lodash.merge'

let instance: ReturnType<typeof createVuetify> | undefined

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

export interface VuetifiableTheme extends ThemeDefinition {
  colors: VuetifiableColors
}

export interface VuetifiableThemes {
  [key: string]: VuetifiableTheme
}

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

export const getInstance = () => {
  if (!instance) {
    throw new Error('Vuetify instance has not been initialized yet')
  }
  return instance
}
