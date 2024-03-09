import type { App } from 'vue'
import type Swal from 'sweetalert2'
import { swal, toast, initializeSounds, notyf } from '../src/ui'
import type * as Tone from 'tone'
import type { Notyf } from 'notyf'

declare module 'vue' {
  interface ComponentCustomProperties {
    $swal?: typeof Swal
    $toast?: typeof Swal
    $notyf?: Notyf
    $sounds?: Record<string, Tone.Player>
  }
  interface InjectionKey<T> extends Symbol {
    swal: typeof Swal
    toast: typeof Swal
    notyf: Notyf
    sounds?: Record<string, Tone.Player>
  }
}

export interface UiPluginOptions {
  sounds?: Record<string, string>
}

/**
 * A plugin for additional non-vuetify UI components
 */
export const UiPlugin = {
  install: (app: App, options?: UiPluginOptions) => {
    app.provide('swal', swal)
    app.config.globalProperties.$swal = swal
    app.provide('toast', toast)
    app.config.globalProperties.$toast = toast
    app.provide('notyf', notyf)
    app.config.globalProperties.$notyf = notyf
    const soundsMap = options?.sounds ? initializeSounds(options.sounds) : initializeSounds({})
    app.provide('sounds', soundsMap)
    app.config.globalProperties.$sounds = soundsMap
  },
}
