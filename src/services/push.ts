/**
 * @module @jakguru/vueprint/services/push
 */
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { Messaging, Unsubscribe } from 'firebase/messaging'
import type { ComputedRef, Ref, WatchStopHandle } from 'vue'
import type { BusEventCallbackSignatures } from './bus'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import Push from 'push.js'
import { computed, ref, watch } from 'vue'
import { BusService } from './bus'
import { getDebugger } from '../utilities/debug'
import { LocalStorageService } from './localStorage'
import { IdentityService } from './identity'
import { MiliCron } from '../libs/milicron'
import { isAxiosInstance } from './api'
import Joi from 'joi'
import type { ApiService } from './api'

const debug = getDebugger('Push')
const fbug = getDebugger('Firebase', '#1B3A57', '#FFCA28')
const sbug = getDebugger('Service Worker')

/**
 * Describes the possible states of push permission.
 */
type PushPermission =
  | typeof Push.Permission.GRANTED
  | typeof Push.Permission.DENIED
  | typeof Push.Permission.DEFAULT

/**
 * Describes the shape of an event that can be triggered and then forwarded to the bus.
 */
export interface PushedEvent {
  event: string
  detail?: any
}

/**
 * Describes the shape of the callback that is used to store the Firebase Messaging Token in an external service which requires it.
 */
export interface FirebaseTokenAuthenticationCallback {
  (token: string, api: ApiService, signal?: AbortSignal): Promise<void> | void
}

/**
 * Describes the options for creating a web push notification.
 */
export interface WebPushNotificationOptions {
  title: string
  body?: string
  icon?: string
  link?: string
  requireInteraction?: boolean
  timeout?: number
  vibrate?: number[]
  silent?: boolean
  closeOnClick?: boolean
  onClick?: (event: Event) => void
  onClose?: (event: Event) => void
  onError?: (error: Error) => void
  onShow?: (event: Event) => void
}

/**
 * Describes the schema for the options for creating a web push notification.
 * @see {@link WebPushNotificationOptions}
 */
export const webPushNotificationOptionsSchema = Joi.object<WebPushNotificationOptions>({
  title: Joi.string().required(),
  body: Joi.string().optional(),
  icon: Joi.string().optional(),
  link: Joi.string().uri().optional(),
  requireInteraction: Joi.boolean().optional(),
  timeout: Joi.number().optional(),
  vibrate: Joi.array().items(Joi.number()).optional(),
  silent: Joi.boolean().optional(),
  closeOnClick: Joi.boolean().optional(),
  onClick: Joi.func().optional(),
  onClose: Joi.func().optional(),
  onError: Joi.func().optional(),
  onShow: Joi.func().optional(),
})

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state | ServiceWorker.State}
 */
type ServiceWorkerState =
  | undefined // The ServiceWorker is not registered
  | 'parsed' // The initial state of a service worker after it is downloaded and confirmed to be runnable.
  | 'installing' // The service worker in this state is considered an installing worker. This is primarily used to ensure that the service worker is not active until all of the core caches are populated.
  | 'installed' // The service worker in this state is considered a waiting worker.
  | 'activating' // The service worker in this state is considered an active worker. No functional events are dispatched until the state becomes activated.
  | 'activated' // The service worker in this state is considered an active worker ready to handle functional events.
  | 'waiting' // The service worker in this state is considered a waiting worker. Unclear if this is a valid state since it is not documented in the MDN documentation.
  | 'redundant' // A new service worker is replacing the current service worker, or the current service worker is being discarded due to an install failure.

/**
 * The Push service handles the integration between the application and the browser API's for Push / Desktop notifications and the service workers which are used to enable background push notifications.
 *
 * ## Accessing the Push Service
 *
 * The Push Service is both injectable and accessible from the global `Vue` instance:
 *
 * ```vue
 *
 * <script lang="ts">
 * import { defineComponent, inject } from 'vue'
 * import type { PushService } from '@jakguru/vueprint'
 * export default defineComponent({
 *     setup() {
 *         const push = inject<PushService>('push')
 *         return {}
 *     }
 *     mounted() {
 *         const push: PushService = this.config.globalProperties.$push
 *     }
 * })
 * </script>
 * ```
 *
 * ## Using the Push Service
 *
 * ### Determining Push Permission State
 *
 * Using the accessor {@link PushService.canPush} and {@link PushService.canRequestPermission}, you can determine if the visitor has already permitted push notifications (or web push notifications) or if the application is allowed to request those permissions. This can be used to display a prompt in the UI to request permissions for Push notifications.
 *
 * It is also possible to activate the permission flow of the browser by triggering {@link PushService.requestPushPermission} method, or to request that the application disable the {@link PushService.canRequestPermission} from returning `true` by triggering the {@link PushService.doNotRequestPushPermission} method.
 *
 * It is also possible to manually trigger a desktop notification by calling the {@link PushService.createWebPushNotification} method.
 */
export class PushService {
  readonly #booted: Ref<boolean>
  readonly #bus: BusService
  readonly #ls: LocalStorageService
  readonly #cron: MiliCron
  readonly #identity: IdentityService
  readonly #api: ApiService
  readonly #firebaseApp: FirebaseApp
  readonly #firebaseMessaging: Messaging
  readonly #serviceWorkerRegistration: Ref<ServiceWorkerRegistration | undefined>
  readonly #serviceWorkerRegistrationToken: Ref<string | undefined>
  readonly #pushPermission: Ref<PushPermission | undefined>
  readonly #doNotAskForPermissionPreference: Ref<boolean | undefined>
  readonly #canRequestPermission: ComputedRef<boolean>
  readonly #canPush: ComputedRef<boolean | null>
  readonly #onAuthenticatedForFirebase: FirebaseTokenAuthenticationCallback
  readonly #onUnauthenticatedForFirebase: FirebaseTokenAuthenticationCallback
  readonly #serviceWorkerPath: undefined | null | string
  readonly #serviceWorkerMode: undefined | null | 'classic' | 'module'
  readonly #serviceWorkerState: Ref<ServiceWorkerState>

  #serviceWorkerRegistrationWatchStopHandle: WatchStopHandle | undefined
  #serviceWorkerRegistrationTokenWatchStopHandle: WatchStopHandle | undefined
  #pushPermissionWatchStopHandle: WatchStopHandle | undefined
  #doNotAskForPermissionPreferenceWatchStopHandle: WatchStopHandle | undefined
  #identityAuthenticatedWatchStopHandle: WatchStopHandle | undefined
  #apiFirebaseOperationAbortController: AbortController | undefined
  #fcmOnMessageUnsubscribe: Unsubscribe | undefined

  /**
   * Create a new PushService instance.
   * @param bus The BusService instance to use for communication
   * @param ls The LocalStorageService instance to use for storing and retrieving preferences and tokens
   * @param cron The MiliCron instance to use for scheduling updates
   * @param identity The IdentityService instance to use for determining if the user is authenticated
   * @param firebaseOptions The options to use for initializing Firebase
   * @param onAuthenticatedForFirebase The callback to use for storing the Firebase Messaging Token in an external service when the user is authenticated
   * @param onUnauthenticatedForFirebase The callback to use for removing the Firebase Messaging Token from an external service when the user is unauthenticated
   * @param serviceWorkerPath The path to the service worker to use for handling push notifications
   * @param serviceWorkerMode The mode to use for the service worker
   */
  constructor(
    bus: BusService,
    ls: LocalStorageService,
    cron: MiliCron,
    identity: IdentityService,
    api: ApiService,
    firebaseOptions: FirebaseOptions,
    onAuthenticatedForFirebase: FirebaseTokenAuthenticationCallback,
    onUnauthenticatedForFirebase: FirebaseTokenAuthenticationCallback,
    serviceWorkerPath?: undefined | null | string,
    serviceWorkerMode?: undefined | null | 'classic' | 'module'
  ) {
    if (!(bus instanceof BusService)) {
      throw new Error('Invalid or missing BusService instance')
    }
    if (!(ls instanceof LocalStorageService)) {
      throw new Error('Invalid or missing LocalStorageService instance')
    }
    if (!(cron instanceof MiliCron)) {
      throw new Error('Invalid or missing MiliCron instance')
    }
    if (!(identity instanceof IdentityService)) {
      throw new Error('Invalid or missing IdentityService instance')
    }
    if (!isAxiosInstance(api)) {
      throw new Error('Invalid or missing ApiService instance')
    }
    this.#booted = ref(false)
    this.#serviceWorkerState = ref(undefined)
    this.#bus = bus
    this.#ls = ls
    this.#cron = cron
    this.#identity = identity
    this.#api = api
    this.#serviceWorkerRegistration = ref(undefined)
    this.#serviceWorkerRegistrationToken = ref(undefined)
    this.#pushPermission = ref(undefined)
    this.#doNotAskForPermissionPreference = ref(undefined)
    this.#onAuthenticatedForFirebase = onAuthenticatedForFirebase
    this.#onUnauthenticatedForFirebase = onUnauthenticatedForFirebase
    this.#serviceWorkerPath = serviceWorkerPath
    this.#serviceWorkerMode = serviceWorkerMode
    this.#canRequestPermission = computed(() => {
      if (
        true === this.#doNotAskForPermissionPreference.value ||
        undefined === this.#doNotAskForPermissionPreference.value
      ) {
        return false
      }
      switch (this.#pushPermission.value) {
        case Push.Permission.DEFAULT:
          return true
        default:
          return false
      }
    })
    this.#canPush = computed(() => {
      switch (this.#pushPermission.value) {
        case Push.Permission.DENIED:
          return false
        case Push.Permission.GRANTED:
          return true
        case Push.Permission.DEFAULT:
          return null
        default:
          return false
      }
    })
    try {
      this.#firebaseApp = initializeApp(firebaseOptions)
    } catch (error) {
      fbug('Failed to Initialize Firebase Application', error.message)
    }
    if (this.#firebaseApp) {
      try {
        this.#firebaseMessaging = getMessaging(this.#firebaseApp)
      } catch (error) {
        fbug('Failed to Initialize Firebase Messaging', error.message)
      }
    }
    if (this.#firebaseApp && this.#firebaseMessaging) {
      fbug('Firebase Application & Messaging Initialized')
    } else {
      fbug('Firebase Application & Messaging Skipped')
    }
  }

  /**
   * Whether or not the service has been booted.
   */
  public get booted() {
    return this.#booted
  }

  /**
   * Whether or not the UI should show a prompt for the user to allow push notifications.
   */
  public get canRequestPermission() {
    return this.#canRequestPermission
  }

  /**
   * Whether or not permissions have been granted for push notifications.
   */
  public get canPush() {
    return this.#canPush
  }

  /**
   * The current state of the service worker.
   */
  public get serviceWorkerState() {
    return computed(() => this.#serviceWorkerState.value)
  }

  /**
   * If there is an update pending for the service worker.
   */
  public get appUpdatePending() {
    return computed(() => this.#serviceWorkerState.value === 'waiting')
  }

  /**
   * Request permission to show push notifications.
   */
  public requestPushPermission() {
    Push.Permission.request(
      () => {
        debug('Push Permission Granted')
        this.#bus.emit('push:updated', { local: true, crossTab: true })
        this.#bus.emit('push:permission:granted', { local: true, crossTab: true })
      },
      () => {
        debug('Push Permission Denied')
        this.#bus.emit('push:updated', { local: true, crossTab: true })
        this.#bus.emit('push:permission:denied', { local: true, crossTab: true })
      }
    )
  }

  /**
   * Stop asking the user for permission to show push notifications.
   * @returns void
   */
  public doNotRequestPushPermission() {
    if (this.canPush.value) {
      return
    }
    this.#ls.set('push.donotaskforpermission', true)
    this.#bus.emit('push:updated', { local: true, crossTab: true })
  }

  /**
   * Create a web push notification (otherwise known as a desktop notification).
   * @param options The options for the web push notification
   */
  public createWebPushNotification(options: WebPushNotificationOptions) {
    if (!this.canPush.value) {
      return
    }
    const { error, value: wpopts } = webPushNotificationOptionsSchema.validate(options)
    if (error) {
      debug('Web Push Notification Options Error', error)
      return
    }
    const opts = {
      body: wpopts.body,
      icon: wpopts.icon,
      link: wpopts.link,
      requireInteraction: wpopts.requireInteraction,
      timeout: wpopts.timeout,
      vibrate: wpopts.vibrate,
      silent: wpopts.silent,
      onClick: function (event: Event) {
        debug('Web Push Notification Clicked', event)
        if (wpopts.onClick) {
          wpopts.onClick(event)
        }
        if (wpopts.closeOnClick) {
          window.focus()
          this.close()
        }
      },
      onClose: function (event: Event) {
        debug('Web Push Notification Closed', event)
        if (wpopts.onClose) {
          wpopts.onClose(event)
        }
      },
      onError: function (error: Error) {
        debug('Web Push Notification Error', error)
        if (wpopts.onError) {
          wpopts.onError(error)
        }
      },
      onShow: function (event: Event) {
        debug('Web Push Notification Shown', event)
        if (wpopts.onShow) {
          wpopts.onShow(event)
        }
      },
    }
    try {
      debug('Creating Web Push Notification', wpopts.title, opts)
      // @ts-ignore - Push.js has incorrect types for notification creation options
      Push.create(wpopts.title, opts)
    } catch (error) {
      debug('Web Push Notification Error', error)
    }
  }

  /**
   * Reset the preference to ask the user for permission to show push notifications.
   * @private
   * @returns void
   * @remarks This is a function that should only be used for development and testing purposes.
   */
  public $resetDoNotRequestPushPermissionPreference() {
    this.#ls.remove('push.donotaskforpermission')
    this.#bus.emit('push:updated', { local: true, crossTab: true })
  }

  /**
   * Update the service worker state reference so we can do things based on it.
   */
  #updateServiceWorkerState(registration?: ServiceWorkerRegistration) {
    if (registration) {
      switch (true) {
        case null !== registration.installing:
          this.#serviceWorkerState.value = 'installing'
          break
        case null !== registration.waiting:
          this.#serviceWorkerState.value = 'waiting'
          break
        case null !== registration.active:
          this.#serviceWorkerState.value = 'activated'
          break
      }
      return
    }
    if (
      'undefined' !== typeof window &&
      'undefined' !== typeof navigator &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        this.#updateServiceWorkerState(registration)
      })
    }
  }

  /**
   * Boot the service.
   */
  public boot() {
    if (this.#booted.value) {
      return
    }
    debug('Booting')
    const booted = () => {
      this.#booted.value = true
      debug('Booted')
    }
    this.#serviceWorkerRegistrationWatchStopHandle = watch(
      () => this.#serviceWorkerRegistration.value,
      (is, was) => {
        if (was === is) {
          return
        }
        debug('Service Worker Registration Changed', { was, is })
        // if (this.canPush.value && is) {
        if (is) {
          this.#updateFcmToken()
        } else if (!this.#serviceWorkerRegistrationToken.value) {
          fbug('Skipped generating Firebase Messaging Token', {
            canPush: this.canPush.value,
            serviceWorkerRegistration: 'undefined' !== typeof this.#serviceWorkerRegistration.value,
          })
        }
      },
      {
        immediate: true,
        deep: true,
      }
    )
    this.#serviceWorkerRegistrationTokenWatchStopHandle = watch(
      () => this.#serviceWorkerRegistrationToken.value,
      (is, was) => {
        if (was === is) {
          return
        }
        fbug('Notifying of Firebase Messaging Token Update', { token: is })
        this.#bus.emit('firebase:token:updated', { local: true, crossTab: true }, is)
        this.#updateApiAboutFirebase()
      },
      {
        immediate: true,
        deep: true,
      }
    )
    this.#pushPermissionWatchStopHandle = watch(
      () => this.#pushPermission.value,
      (is, was) => {
        if (was === is) {
          return
        }
        debug('Push Permission Changed', { was, is })
        if (this.canPush.value && this.#serviceWorkerRegistration.value) {
          this.#updateFcmToken()
        } else if (!this.#serviceWorkerRegistrationToken.value) {
          fbug('Skipped generating Firebase Messaging Token', {
            canPush: this.canPush.value,
            serviceWorkerRegistration: 'undefined' !== typeof this.#serviceWorkerRegistration.value,
          })
        }
      },
      {
        immediate: true,
        deep: true,
      }
    )
    this.#doNotAskForPermissionPreferenceWatchStopHandle = watch(
      () => this.#doNotAskForPermissionPreference.value,
      (is, was) => {
        if (was === is) {
          return
        }
        debug('Do Not Ask For Permission Preference Changed', { was, is })
      },
      {
        immediate: true,
        deep: true,
      }
    )
    this.#identityAuthenticatedWatchStopHandle = watch(
      () => this.#identity.authenticated.value,
      (is, was) => {
        if (was === is) {
          return
        }
        this.#updateApiAboutFirebase()
      },
      {
        immediate: true,
        deep: true,
      }
    )
    this.#cron.$on('*/250 * * * * *', this.#update.bind(this))
    this.#bus.on('push:updated', this.#update.bind(this), { local: true, crossTab: true })
    this.#bus.on('sw:install', this.#onServiceWorkerInstall.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#doUpdates(true)
    if (
      'undefined' !== typeof window &&
      'undefined' !== typeof navigator &&
      'serviceWorker' in navigator
    ) {
      if ('undefined' === typeof this.#serviceWorkerRegistration.value) {
        if (!this.#serviceWorkerPath || !this.#serviceWorkerMode) {
          debug('Service Worker Path or Mode not set, skipping registration')
          return booted()
        }
        debug('Attempting to register Service Worker', {
          path: this.#serviceWorkerPath,
          mode: this.#serviceWorkerMode,
        })
        navigator.serviceWorker
          .register(this.#serviceWorkerPath, { type: this.#serviceWorkerMode })
          .then((registration) => {
            sbug('Service Worker Registered', registration)
            this.#serviceWorkerRegistration.value = registration
          })
          .catch((error) => {
            sbug('Service Worker Registration Failed', error)
          })
      }
      navigator.serviceWorker.addEventListener('message', (event) => {
        sbug('Got new message from service worker', event.data)
        if (
          event.data.messageType === 'push-received' &&
          event.data.data &&
          event.data.data.event
        ) {
          sbug('Got push notification from service worker', event.data.data)
          const { event: pushEvent, detail } = event.data.data as PushedEvent
          const busEvent = `background:${pushEvent}` as keyof BusEventCallbackSignatures
          this.#bus.emit(busEvent, { local: true }, detail)
        }
        if (event.data.messageType === 'sw-received' && event.data.data && event.data.data.event) {
          sbug('Got event from service worker', event.data.data)
          const { event: pushEvent, detail } = event.data.data as PushedEvent
          const busEvent = `background:${pushEvent}` as keyof BusEventCallbackSignatures
          this.#bus.emit(busEvent, { local: true }, detail)
        }
        if (event.data.notification) {
          this.#bus.emit('push:notification', { local: true }, event.data.notification)
        }
      })
      navigator.serviceWorker.addEventListener('messageerror', (event) => {
        sbug('Got new message error from service worker', event.data)
      })
      navigator.serviceWorker.ready.then((registration) => {
        sbug('Service Worker Ready', registration)
        this.#serviceWorkerRegistration.value = registration
        this.#updateServiceWorkerState(registration)
      })
      navigator.serviceWorker.addEventListener('controllerchange', (event) => {
        sbug('Service Worker saw Controller Change', event)
      })
    }
    if (this.#firebaseMessaging) {
      this.#fcmOnMessageUnsubscribe = onMessage(this.#firebaseMessaging, (payload) => {
        this.#bus.emit('push:firebase:message', { local: true }, payload)
        fbug('Got Firebase Messaging Payload', payload)
        if (payload.data && payload.data.event) {
          const { event: pushEvent, detail } = payload.data as unknown as PushedEvent
          const busEvent = `background:${pushEvent}` as keyof BusEventCallbackSignatures
          this.#bus.emit(busEvent, { local: true }, detail)
        }
      })
      fbug('Firebase Messaging On Message Subscribed')
    }
    return booted()
  }

  /**
   * Shut down the service.
   */
  public shutdown() {
    if (!this.#booted.value) {
      return
    }
    debug('Shutting Down')
    this.#bus.off('push:updated', this.#update.bind(this), { local: true, crossTab: true })
    this.#bus.off('sw:install', this.#onServiceWorkerInstall.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#cron.$off('*/250 * * * * *', this.#update.bind(this))
    if (this.#serviceWorkerRegistrationWatchStopHandle) {
      this.#serviceWorkerRegistrationWatchStopHandle()
    }
    if (this.#serviceWorkerRegistrationTokenWatchStopHandle) {
      this.#serviceWorkerRegistrationTokenWatchStopHandle()
    }
    if (this.#pushPermissionWatchStopHandle) {
      this.#pushPermissionWatchStopHandle()
    }
    if (this.#doNotAskForPermissionPreferenceWatchStopHandle) {
      this.#doNotAskForPermissionPreferenceWatchStopHandle()
    }
    if (this.#identityAuthenticatedWatchStopHandle) {
      this.#identityAuthenticatedWatchStopHandle()
    }
    if (this.#apiFirebaseOperationAbortController) {
      this.#apiFirebaseOperationAbortController.abort()
    }
    if (this.#fcmOnMessageUnsubscribe) {
      this.#fcmOnMessageUnsubscribe()
    }
    debug('Shut Down')
  }

  public async update() {
    if (
      !(
        'undefined' !== typeof window &&
        'undefined' !== typeof navigator &&
        'serviceWorker' in navigator
      )
    ) {
      debug('Not in a context with a Service Worker')
      return
    }
    if (!this.appUpdatePending.value) {
      debug('No Service Worker Update Pending')
      return
    }
    const registration = await navigator.serviceWorker.ready
    if (!registration.waiting) {
      debug('No Waiting Service Worker')
      return
    }
    const finished = new Promise<Event>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
    })
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    await finished
    if (window && window.location) {
      window.location.reload()
    } else {
      debug('Finished waiting for Service Worker to update')
    }
  }

  #doUpdates(first: boolean = false) {
    if (!this.#ls.loaded) {
      if (first) {
        this.#ls.promise.then(() => {
          this.#doUpdates(first)
        })
      }
      return
    }
    const doNotAskForPermission = this.#ls.get('push.donotaskforpermission') || false
    this.#doNotAskForPermissionPreference.value = doNotAskForPermission
    this.#pushPermission.value = Push.Permission.get()
    this.#updateServiceWorkerState()
  }

  #update() {
    this.#doUpdates()
  }

  #updateFcmToken() {
    if (!this.#serviceWorkerRegistration.value || !this.canPush.value) {
      return
    }
    if (this.#serviceWorkerRegistrationToken.value) {
      return
    }
    getToken(this.#firebaseMessaging, {
      serviceWorkerRegistration: this.#serviceWorkerRegistration.value,
    })
      .then((token) => {
        if (token) {
          fbug('Firebase Messaging Token', token)
          this.#serviceWorkerRegistrationToken.value = token
          if (this.#ls.loaded) {
            this.#ls.set('push.serviceworker.registration.token', token)
          } else {
            this.#ls.promise.then(() => {
              this.#ls.set('push.serviceworker.registration.token', token)
            })
          }
        } else {
          fbug('No Firebase Messaging Token')
        }
      })
      .catch((error) => {
        fbug('Error retreiving Firebase Messaging Token', error)
      })
  }

  #updateApiAboutFirebase() {
    if (this.#serviceWorkerRegistrationToken.value) {
      const is = this.#identity.authenticated.value
      if (this.#apiFirebaseOperationAbortController) {
        this.#apiFirebaseOperationAbortController.abort()
      }
      this.#apiFirebaseOperationAbortController = new AbortController()
      try {
        if (is) {
          ;(async () => {
            fbug('Registering Firebase Messaging Token')
            try {
              await this.#onAuthenticatedForFirebase(
                this.#serviceWorkerRegistrationToken.value!,
                this.#api,
                this.#apiFirebaseOperationAbortController!.signal
              )
              fbug('Registered Firebase Messaging Token')
            } catch (error) {
              if (
                (error instanceof Error && error.name !== 'CancelError') ||
                !(error instanceof Error)
              ) {
                fbug('Failed to register Firebase Messaging Token', error)
              }
            }
          })()
        } else {
          ;(async () => {
            fbug('Unregistering Firebase Messaging Token')
            try {
              await this.#onUnauthenticatedForFirebase(
                this.#serviceWorkerRegistrationToken.value!,
                this.#api,
                this.#apiFirebaseOperationAbortController!.signal
              )
              fbug('Unregistered Firebase Messaging Token')
            } catch (error) {
              if (
                (error instanceof Error && error.name !== 'CancelError') ||
                !(error instanceof Error)
              ) {
                fbug('Failed to unregister Firebase Messaging Token', error)
              }
            }
          })()
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'CancelError') {
          fbug('API Firebase Operation threw and Error', error)
        }
      }
    }
  }

  #onServiceWorkerInstall(event: Event) {
    sbug('Service Worker Installed might be waiting', event)
    this.#updateServiceWorkerState()
  }
}
