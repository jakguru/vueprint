/**
 * @module @jakguru/vueprint/services
 */
export * as api from './api'
export * as bus from './bus'
export * as cron from './cron'
export * as identity from './identity'
export * as localStorage from './localStorage'
export * as push from './push'
export * as ui from './ui'
export * as vuetify from './vuetify'

import type { MiliCron } from '../libs/milicron'
import type { ApiService } from './api'
import type {
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
  BusService,
} from './bus'
import type { IdentityService, TokenRefreshCallback } from './identity'
import type { LocalStorageService } from './localStorage'
import type { PushedEvent, FirebaseTokenAuthenticationCallback, PushService } from './push'
import type { SwalService, ToastService, NotyfService, SoundsService } from './ui'
import type {
  VuetifyInstance,
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
} from './vuetify'

export {
  ApiService,
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
  BusService,
  LocalStorageService,
  PushedEvent,
  FirebaseTokenAuthenticationCallback,
  PushService,
  SwalService,
  ToastService,
  NotyfService,
  SoundsService,
  VuetifyInstance,
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
  IdentityService,
  MiliCron as CronService,
  TokenRefreshCallback,
}
