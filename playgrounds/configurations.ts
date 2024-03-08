import type {
  BusPluginOptions,
  LocalStoragePluginOptions,
  VuetifyPluginOptions,
  ApiPluginOptions,
  PushPluginOptions,
  IdentityPluginOptions,
} from '../plugins'

export const busPluginOptions: BusPluginOptions = {
  namespace: 'vueprint',
}
export const localStoragePluginOptions: LocalStoragePluginOptions = {
  namespace: 'vueprint',
}
export const vuetifyPluginOptions: VuetifyPluginOptions = {
  defaultTheme: 'vueprint',
  themes: {
    vueprint: {
      dark: true,
      colors: {
        background: '#227fb9',
        surface: '#aac2d0',
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
export const apiPluginOptions: ApiPluginOptions = {}
export const pushPluginOptions: PushPluginOptions = {}
export const identityPluginOptions: IdentityPluginOptions = {}

export const vueprintModuleOptions = {
  bus: busPluginOptions,
  ls: localStoragePluginOptions,
  vuetify: vuetifyPluginOptions,
  api: apiPluginOptions,
  identity: identityPluginOptions,
  push: pushPluginOptions,
}

export const vueprintMainPluginOptions = {
  bus: busPluginOptions,
  ls: localStoragePluginOptions,
  vuetify: vuetifyPluginOptions,
  api: apiPluginOptions,
  identity: identityPluginOptions,
}

export const vueprintClientPluginOptions = {
  push: pushPluginOptions,
}
