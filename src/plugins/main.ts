import type { App } from 'vue'
import { BusPlugin, BusPluginOptions } from './bus'
import { CronPlugin } from './cron'
import { LocalStoragePlugin, LocalStoragePluginOptions } from './ls'
import { VuetifyPlugin, VuetifyPluginOptions } from './vuetify'
import { ApiPlugin, ApiPluginOptions } from './api'
import { IdentityPlugin, IdentityPluginOptions } from './identity'

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
const VueMainBootstrap = {
  install: (app: App, options?: VueMainBootstrapOptions) => {
    app.use(BusPlugin, options?.bus)
    app.use(CronPlugin)
    app.use(LocalStoragePlugin, options?.ls)
    app.use(VuetifyPlugin, options?.vuetify)
    app.use(ApiPlugin, options?.api)
    app.use(IdentityPlugin, options?.identity)
  },
}

export default VueMainBootstrap
