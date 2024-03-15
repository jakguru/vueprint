import type { App } from 'vue'
import { ref } from 'vue'
import Webfont from 'webfontloader'
import { getDebugger } from '../utilities/debug'

const debug = getDebugger('Webfontloader')

export interface WebfontloaderPluginOptions extends WebFont.Config {}

export const WebfontloaderPlugin = {
  install: (app: App, options?: WebfontloaderPluginOptions) => {
    const installed = ref(false)
    if (
      installed.value === false &&
      options &&
      (options.custom || options.google || options.typekit || options.fontdeck || options.monotype)
    ) {
      const onLoading = () => {
        if (options && options.loading && 'function' === typeof options.loading) {
          options.loading()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:loading', { local: true })
        }
        debug('Webfonts loading')
      }
      const onActive = () => {
        if (options && options.active && 'function' === typeof options.active) {
          options.active()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:active', { local: true })
        }
        debug('Webfonts active')
      }
      const onInactive = () => {
        if (options && options.inactive && 'function' === typeof options.inactive) {
          options.inactive()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:inactive', { local: true })
        }
        debug('Webfonts inactive')
      }
      try {
        Webfont.load({ ...options, loading: onLoading, active: onActive, inactive: onInactive })
        installed.value = true
      } catch (error) {
        debug('Error loading webfonts', error)
      }
    } else if (installed.value === false) {
      debug('No webfonts to load')
    }
  },
}
