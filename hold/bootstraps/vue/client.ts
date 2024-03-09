import type { App } from 'vue'
import { PushPlugin, PushPluginOptions } from '../../plugins/push'
import { UiPlugin } from '../../plugins/ui'

/**
 * The options for the client-only Vue bootstrap
 */
export interface VueClientBootstrapOptions {
  push?: PushPluginOptions
  sounds?: Record<string, string>
}

/**
 * A plugin which bootstraps all of the Vue plugins which can only be loaded in a client environment, in the correct order
 */
const VueClientBootstrap = {
  install: (app: App, options?: VueClientBootstrapOptions) => {
    app.use(PushPlugin, options?.push)
    app.use(UiPlugin, { sounds: options?.sounds })
  },
}

export default VueClientBootstrap
