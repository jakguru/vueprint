import type { App } from 'vue'
import type Swal from 'sweetalert2'
import { swal, toast } from 'src/ui'

declare module 'vue' {
  interface ComponentCustomProperties {
    $swal?: typeof Swal
    $toast?: typeof Swal
  }
  interface InjectionKey<T> extends Symbol {
    swal: typeof Swal
    toast: typeof Swal
  }
}

export default {
  install: (app: App) => {
    app.provide('swal', swal)
    app.config.globalProperties.$swal = swal
    app.provide('toast', toast)
    app.config.globalProperties.$toast = toast
  },
}
