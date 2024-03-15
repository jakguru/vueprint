import type { App } from 'vue'
import Webfont from 'webfontloader'
import { getDebugger } from '../utilities/debug'

const debug = getDebugger('Webfontloader')

export interface WebfontloaderPluginOptions extends WebFont.Config {}

export const WebfontloaderPlugin = {
  install: (app: App, options?: WebfontloaderPluginOptions) => {
    if (
      options &&
      (options.custom || options.google || options.typekit || options.fontdeck || options.monotype)
    ) {
      options.loading = () => {
        if (options.loading) {
          options.loading()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:loading', { local: true })
        }
        debug('Webfonts loading')
      }
      options.active = () => {
        if (options.active) {
          options.active()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:active', { local: true })
        }
        debug('Webfonts active')
      }
      options.inactive = () => {
        if (options.inactive) {
          options.inactive()
        }
        if (app.config.globalProperties.$bus) {
          app.config.globalProperties.$bus.emit('webfonts:inactive', { local: true })
        }
        debug('Webfonts inactive')
      }
      try {
        Webfont.load(options)
      } catch (error) {
        debug('Error loading webfonts', error)
      }
    } else {
      debug('No webfonts to load')
    }
  },
}
