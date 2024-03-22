/**
 * @module @jakguru/vueprint/plugins/ui
 */
import './augmentations'
import type { App, Plugin } from 'vue'
import { swal, toast, SoundsService, notyf } from '../services/ui'

export interface UiPluginOptions {
  sounds?: Record<string, string>
}

/**
 * A plugin for additional non-vuetify UI components
 */
export const UiPlugin: Plugin<UiPluginOptions> = {
  install: (app: App, options?: UiPluginOptions) => {
    app.provide('swal', swal)
    app.config.globalProperties.$swal = swal
    app.provide('toast', toast)
    app.config.globalProperties.$toast = toast
    app.provide('notyf', notyf)
    app.config.globalProperties.$notyf = notyf
    const soundServiceInstance = new SoundsService(options?.sounds || {})
    app.provide('sounds', soundServiceInstance)
    app.config.globalProperties.$sounds = soundServiceInstance
  },
}
