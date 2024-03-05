import '@mdi/font/css/materialdesignicons.css'
import type { VuetifyOptions } from 'vuetify'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const colors = {
  background: '#212121',
  surface: '#333333',
  primary: '#d32f2f',
  secondary: '#4d4d4d',
  accent: '#f7931a',
  highlight: '#0d579b',
  notify: '#E53935',
  success: '#06972E',
  info: '#3F51B5',
  warning: '#FFA000',
  error: '#E43333',
  question: '#554C7D',
  cancel: '#666666',
}
const allColorNames = new Set(Object.keys(colors))
export const config: VuetifyOptions = {
  ssr: true,
  theme: {
    defaultTheme: 'tmp',
    variations: {
      colors: Array.from(allColorNames),
      lighten: 5,
      darken: 5,
    },
    themes: {
      tmp: {
        dark: false,
        colors,
      },
    },
  },
  aliases: {},
  defaults: {
    Swal: {
      backdrop: true,
      color: '#000000',
      background: colors.surface,
      customClass: {
        title: 'text-h6',
        htmlContainer: 'text-body-2',
        popup:
          'v-card v-theme--tmp v-card--density-default v-card--variant-elevated bg-surface elevation-3 pb-3',
        confirmButton:
          'v-btn v-btn--elevated v-theme--tmp bg-primary v-btn--density-default v-btn--size-default v-btn--variant-elevated',
        denyButton:
          'v-btn v-btn--elevated v-theme--tmp bg-error v-btn--density-default v-btn--size-default v-btn--variant-elevated',
        cancelButton:
          'v-btn v-btn--elevated v-theme--tmp bg-cancel v-btn--density-default v-btn--size-default v-btn--variant-elevated',
      },
      confirmButtonColor: colors.primary,
      denyButtonColor: colors.error,
      cancelButtonColor: colors.cancel,
      buttonsStyling: true,
      reverseButtons: true,
    },
    VTextField: {
      variant: 'outlined',
      bgColor: 'surface',
      baseColor: 'accent',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      bgColor: 'surface',
      baseColor: 'accent',
      hideDetails: 'auto',
      itemTitle: 'title',
      itemValue: 'value',
    },
    VAutocomplete: {
      variant: 'outlined',
      bgColor: 'surface',
      baseColor: 'accent',
      hideDetails: 'auto',
      itemTitle: 'title',
      itemValue: 'value',
    },
    VSwitch: {
      color: 'primary',
      hideDetails: 'auto',
    },
    VFileInput: {
      variant: 'outlined',
      bgColor: 'surface',
      baseColor: 'accent',
      hideDetails: 'auto',
    },
  },
}

export const vuetify = createVuetify(config)
