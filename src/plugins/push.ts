/**
 * @module @jakguru/vueprint/plugins/push
 */
import './augmentations'
import type { App, Plugin } from 'vue'
import type { FirebaseOptions } from 'firebase/app'
import type { FirebaseTokenAuthenticationCallback } from '../services/push'
import { PushService } from '../services/push'

/**
 * The options for the push plugin
 */
export interface PushPluginOptions {
  firebaseOptions?: FirebaseOptions
  onAuthenticatedForFirebase?: FirebaseTokenAuthenticationCallback
  onUnauthenticatedForFirebase?: FirebaseTokenAuthenticationCallback
  serviceWorkerPath?: undefined | null | string
  serviceWorkerMode?: undefined | null | 'classic' | 'module'
}

/**
 * A plugin for managing push notifications and integration with Firebase Cloud Messaging
 */
export const PushPlugin: Plugin<PushPluginOptions> = {
  install: (app: App, options?: PushPluginOptions) => {
    const firebaseOptions = options?.firebaseOptions || {}
    const onAuthenticatedForFirebase = options?.onAuthenticatedForFirebase || (() => {})
    const onUnauthenticatedForFirebase = options?.onUnauthenticatedForFirebase || (() => {})
    const serviceWorkerPath = options?.serviceWorkerPath
    const serviceWorkerMode = options?.serviceWorkerMode
    const instance = new PushService(
      app.config.globalProperties.$bus!,
      app.config.globalProperties.$ls!,
      app.config.globalProperties.$cron!,
      app.config.globalProperties.$identity!,
      firebaseOptions,
      onAuthenticatedForFirebase,
      onUnauthenticatedForFirebase,
      serviceWorkerPath,
      serviceWorkerMode
    )
    app.provide('push', instance)
    app.config.globalProperties.$push = instance
  },
}
