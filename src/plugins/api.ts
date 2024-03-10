import './augmentations'
import type { App } from 'vue'
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
export const ApiPlugin = {
  install: (app: App, options?: ApiPluginOptions) => {
    const baseURL = options?.baseURL || window ? window.location.origin : 'http://localhost:3000'
    const instance = initializeApi(
      baseURL,
      app.config.globalProperties.$ls!,
      app.config.globalProperties.$bus!
    )
    app.provide('api', instance)
    app.config.globalProperties.$api = instance
  },
}
