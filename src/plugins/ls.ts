import './augmentations'
import type { App } from 'vue'
import { LocalStorageService } from '../services/localStorage'

/**
 * The options for the local storage plugin
 */
export interface LocalStoragePluginOptions {
  namespace?: string
}

/**
 * A plugin for interacting with local browser storage
 */
export const LocalStoragePlugin = {
  install: (app: App, options?: LocalStoragePluginOptions) => {
    const instance = new LocalStorageService(options?.namespace || 'app')
    app.provide('ls', instance)
    app.config.globalProperties.$ls = instance
  },
}
