import type { App } from 'vue'
import type { FirebaseOptions } from 'firebase/app'
import type { FirebaseTokenAuthenticationCallback } from '../src/push'
import { PushService } from '../src/push'

declare module 'vue' {
  interface ComponentCustomProperties {
    $push?: PushService
  }
  interface InjectionKey<T> extends Symbol {
    push: PushService
  }
}

/**
 * The options for the push plugin
 */
export interface PushPluginOptions {
  firebaseOptions: FirebaseOptions
  onAuthenticatedForFirebase: FirebaseTokenAuthenticationCallback
  onUnauthenticatedForFirebase: FirebaseTokenAuthenticationCallback
  serviceWorkerPath: string
  serviceWorkerMode: 'classic' | 'module'
}

/**
 * A plugin for managing push notifications and integration with Firebase Cloud Messaging
 */
export const PushPlugin = {
  install: (app: App, options?: PushPluginOptions) => {
    const firebaseOptions = options?.firebaseOptions || {}
    const onAuthenticatedForFirebase = options?.onAuthenticatedForFirebase || (() => {})
    const onUnauthenticatedForFirebase = options?.onUnauthenticatedForFirebase || (() => {})
    const serviceWorkerPath = options?.serviceWorkerPath || '/service-worker.js'
    const serviceWorkerMode = options?.serviceWorkerMode || 'classic'
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
