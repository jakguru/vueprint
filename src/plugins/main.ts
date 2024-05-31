/**
 * @module @jakguru/vueprint/plugins/main
 */
import type { App, Plugin } from 'vue'
import { BusPlugin, BusPluginOptions } from './bus'
import { CronPlugin } from './cron'
import { LocalStoragePlugin, LocalStoragePluginOptions } from './ls'
import { VuetifyPlugin, VuetifyPluginOptions } from './vuetify'
import { ApiPlugin, ApiPluginOptions } from './api'
import { IdentityPlugin, IdentityPluginOptions } from './identity'
import { doApplicationMount, doApplicationUnmount } from '../services/installer'

/**
 * The options for the main Vue bootstrap
 */
export interface VueMainBootstrapOptions {
  bus?: BusPluginOptions
  ls?: LocalStoragePluginOptions
  vuetify?: VuetifyPluginOptions
  api?: ApiPluginOptions
  identity?: IdentityPluginOptions
}

/**
 * A plugin which bootstraps all of the Vue plugins which can be loaded in both a client and server environment, in the correct order
 */
const VueMainBootstrap: Plugin<VueMainBootstrapOptions> = {
  install: (app: App, options?: VueMainBootstrapOptions) => {
    app.use(BusPlugin, options?.bus)
    app.use(CronPlugin)
    app.use(LocalStoragePlugin, options?.ls)
    app.use(VuetifyPlugin, options?.vuetify)
    app.use(ApiPlugin, options?.api)
    app.use(IdentityPlugin, options?.identity)
    const originalMount = app.mount
    const originalUnmount = app.unmount
    app.mount = doApplicationMount.bind(app, originalMount)
    app.unmount = doApplicationUnmount.bind(app, originalUnmount)
  },
}

export default VueMainBootstrap
