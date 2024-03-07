import type { App } from 'vue'
import { LocalStorage } from '../src/localStorage'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ls?: LocalStorage
  }
  interface InjectionKey<T> extends Symbol {
    ls: LocalStorage
  }
}

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
    const instance = new LocalStorage(options?.namespace || 'app')
    app.provide('ls', instance)
    app.config.globalProperties.$ls = instance
  },
}
