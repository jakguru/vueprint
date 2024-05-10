/**
 * The Webfontloader plugin is a simple wrapper around the [WebFontLoader](https://github.com/typekit/webfontloader) library which allows you to load custom fonts into your application.
 * @module @jakguru/vueprint/plugins/webfontloader
 *
 * @remarks
 *
 * While not directly accessible, the `ready` computed referenced from the response of the [useVueprint](/api/modules/jakguru_vueprint_utilities#usevueprint) function indicates that the font-loader has completed loading.
 */
import type { App, Plugin } from 'vue'
import { ref } from 'vue'
import * as Webfont from 'webfontloader'
import { getDebugger } from '../utilities/debug'

const debug = getDebugger('Webfontloader')

export interface WebfontloaderPluginCustom extends Webfont.Custom {
  families?: string[] | undefined
  urls?: string[] | undefined
  testStrings?: { [fontFamily: string]: string } | undefined
}
export interface WebfontloaderPluginGoogle extends Webfont.Google {
  api?: string | undefined
  families: string[]
  text?: string | undefined
}
export interface WebfontloaderPluginTypekit extends Webfont.Typekit {
  id?: string | undefined
}
export interface WebfontloaderPluginFontdeck extends Webfont.Fontdeck {
  id?: string | undefined
}
export interface WebfontloaderPluginMonotype extends Webfont.Monotype {
  projectId?: string | undefined
  version?: number | undefined
  loadAllFonts?: boolean | undefined
}

export interface WebfontloaderPluginOptions extends WebFont.Config {
  /** Setting this to false will disable html classes (defaults to true) */
  classes?: boolean | undefined
  /** Settings this to false will disable callbacks/events (defaults to true) */
  events?: boolean | undefined
  /** Time (in ms) until the fontinactive callback will be triggered (defaults to 5000) */
  timeout?: number | undefined
  /** This event is triggered when all fonts have been requested. */
  loading?(): void
  /** This event is triggered when the fonts have rendered. */
  active?(): void
  /** This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded. */
  inactive?(): void
  /** This event is triggered once for each font that's loaded. */
  fontloading?(familyName: string, fvd: string): void
  /** This event is triggered once for each font that renders. */
  fontactive?(familyName: string, fvd: string): void
  /** This event is triggered if the font can't be loaded. */
  fontinactive?(familyName: string, fvd: string): void

  /** Child window or iframe to manage fonts for */
  context?: Window | undefined

  custom?: WebfontloaderPluginCustom | undefined
  google?: WebfontloaderPluginGoogle | undefined
  typekit?: WebfontloaderPluginTypekit | undefined
  fontdeck?: WebfontloaderPluginFontdeck | undefined
  monotype?: WebfontloaderPluginMonotype | undefined
}

/**
 * @private
 */
export const WebfontloaderPlugin: Plugin<WebfontloaderPluginOptions> = {
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
