/**
 * @module @jakguru/vueprint/plugins/api
 */
import './augmentations'
import type { App, Plugin } from 'vue'
import { initializeApi } from '../services/api'

/**
 * The options for the API plugin
 */
export interface ApiPluginOptions {
  baseURL?: string
}

/**
 * A plugin for interacting with an API with a built-in authentication bearer token authentication mechanism
 */
export const ApiPlugin: Plugin<ApiPluginOptions> = {
  install: (app: App, options?: ApiPluginOptions) => {
    const origin =
      'undefined' !== typeof window &&
      'object' === typeof window.location &&
      'string' === typeof window.location.origin
        ? window.location.origin
        : 'http://localhost:3000'
    const baseURL = options?.baseURL || origin
    const instance = initializeApi(
      baseURL,
      app.config.globalProperties.$ls!,
      app.config.globalProperties.$bus!
    )
    app.provide('api', instance)
    app.config.globalProperties.$api = instance
  },
}
