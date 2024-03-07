import type { App } from 'vue'
import { BusPlugin, BusPluginOptions } from '../../plugins/bus'
import { CronPlugin } from '../../plugins/cron'
import { LocalStoragePlugin, LocalStoragePluginOptions } from '../../plugins/ls'
import { VuetifyPlugin, VuetifyPluginOptions } from '../../plugins/vuetify'
import { ApiPlugin, ApiPluginOptions } from '../../plugins/api'
import { IdentityPlugin, IdentityPluginOptions } from '../../plugins/identity'

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
