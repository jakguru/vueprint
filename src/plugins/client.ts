import type { App } from 'vue'
import { PushPlugin, PushPluginOptions } from './push'
import { UiPlugin, UiPluginOptions } from './ui'

/**
 * The options for the client-only Vue bootstrap
 */
export interface VueClientBootstrapOptions {
  push?: PushPluginOptions
  ui?: UiPluginOptions
}

/**
 * A plugin which bootstraps all of the Vue plugins which can only be loaded in a client environment, in the correct order
 */
const VueClientBootstrap = {
  install: (app: App, options?: VueClientBootstrapOptions) => {
    app.use(PushPlugin, options?.push)
    app.use(UiPlugin, { sounds: options?.ui?.sounds })
  },
}

export default VueClientBootstrap
