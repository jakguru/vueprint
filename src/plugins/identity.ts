import './augmentations'
import type { App } from 'vue'
import type { TokenRefreshCallback } from '../services/identity'
import { IdentityService } from '../services/identity'
import { DateTime } from 'luxon'

/**
 * The options for the identity plugin
 */
export interface IdentityPluginOptions {
  tokenRefresh?: TokenRefreshCallback
  tokenRefreshBuffer?: number
}

/**
 * A plugin for managing user identity and authentication
 */
export const IdentityPlugin = {
  install: (app: App, options?: IdentityPluginOptions) => {
    const tokenRefreshBuffer = options?.tokenRefreshBuffer || 60 * 5
    const tokenRefresh =
      options?.tokenRefresh ||
      (() => ({
        bearer: '',
        expiration: DateTime.now()
          .plus({ minutes: tokenRefreshBuffer * 3 })
          .toISO(),
      }))
    const instance = new IdentityService(
      app.config.globalProperties.$bus!,
      app.config.globalProperties.$ls!,
      app.config.globalProperties.$cron!,
      app.config.globalProperties.$api!,
      tokenRefresh,
      tokenRefreshBuffer
    )
    app.provide('identity', instance)
    app.config.globalProperties.$identity = instance
  },
}
