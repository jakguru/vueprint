import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { Messaging, Unsubscribe } from 'firebase/messaging'
import type { ComputedRef, Ref, WatchStopHandle } from 'vue'
import type { BusEventCallbackSignatures } from './bus'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import Push from 'push.js'
import { computed, ref, watch } from 'vue'
import { Bus } from './bus'
import { getDebugger } from './debug'
import { LocalStorage } from './localStorage'
import { Identity } from './identity'
import { MiliCron } from '@jakguru/milicron'

const debug = getDebugger('Push')
const fbug = getDebugger('Firebase', '#1B3A57', '#FFCA28')
const sbug = getDebugger('Service Worker', '#000000', '#FFFFFF')

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
  (token: string, signal?: AbortSignal): Promise<void> | void
}

/**
 * A service which manages desktop notifications and integration with Firebase Messaging.
 */
export class PushService {
  readonly #booted: Ref<boolean>
  readonly #bus: Bus
  readonly #ls: LocalStorage
  readonly #cron: MiliCron
  readonly #identity: Identity
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
  readonly #serviceWorkerPath: string
  readonly #serviceWorkerMode: 'classic' | 'module'
  #serviceWorkerRegistrationWatchStopHandle: WatchStopHandle | undefined
  #serviceWorkerRegistrationTokenWatchStopHandle: WatchStopHandle | undefined
  #pushPermissionWatchStopHandle: WatchStopHandle | undefined
  #doNotAskForPermissionPreferenceWatchStopHandle: WatchStopHandle | undefined
  #identityAuthenticatedWatchStopHandle: WatchStopHandle | undefined
  #apiFirebaseOperationAbortController: AbortController | undefined
  #fcmOnMessageUnsubscribe: Unsubscribe | undefined

  /**
   * Create a new PushService instance.
   * @param bus The Bus instance to use for communication
   * @param ls The LocalStorage instance to use for storing and retrieving preferences and tokens
   * @param cron The MiliCron instance to use for scheduling updates
   * @param identity The Identity instance to use for determining if the user is authenticated
   * @param firebaseOptions The options to use for initializing Firebase
   * @param onAuthenticatedForFirebase The callback to use for storing the Firebase Messaging Token in an external service when the user is authenticated
   * @param onUnauthenticatedForFirebase The callback to use for removing the Firebase Messaging Token from an external service when the user is unauthenticated
   * @param serviceWorkerPath The path to the service worker to use for handling push notifications
   * @param serviceWorkerMode The mode to use for the service worker
   */
  constructor(
    bus: Bus,
    ls: LocalStorage,
    cron: MiliCron,
    identity: Identity,
    firebaseOptions: FirebaseOptions,
    onAuthenticatedForFirebase: FirebaseTokenAuthenticationCallback,
    onUnauthenticatedForFirebase: FirebaseTokenAuthenticationCallback,
    serviceWorkerPath: string,
    serviceWorkerMode: 'classic' | 'module'
  ) {
    if (!(bus instanceof Bus)) {
      throw new Error('Invalid or missing Bus instance')
    }
    if (!(ls instanceof LocalStorage)) {
      throw new Error('Invalid or missing LocalStorage instance')
    }
    if (!(cron instanceof MiliCron)) {
      throw new Error('Invalid or missing MiliCron instance')
    }
    if (!(identity instanceof Identity)) {
      throw new Error('Invalid or missing Identity instance')
    }
    this.#booted = ref(false)
    this.#bus = bus
    this.#ls = ls
    this.#cron = cron
    this.#identity = identity
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
    this.#firebaseApp = initializeApp(firebaseOptions)
    this.#firebaseMessaging = getMessaging(this.#firebaseApp)
    fbug('Firebase Application & Messaging Initialized')
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
   * Boot the service.
   */
  public boot() {
    if (this.#booted.value) {
      return
    }
    debug('Booting')
    this.#serviceWorkerRegistrationWatchStopHandle = watch(
      () => this.#serviceWorkerRegistration.value,
      (is, was) => {
        if (was === is) {
          return
        }
        debug('Service Worker Registration Changed', { was, is })
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
    this.#doUpdates(true)
    if ('undefined' !== typeof window && 'serviceWorker' in navigator) {
      if ('undefined' === typeof this.#serviceWorkerRegistration.value) {
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
      })
    }
    this.#fcmOnMessageUnsubscribe = onMessage(this.#firebaseMessaging, (payload) => {
      fbug('Got Firebase Messaging Payload', payload)
      if (payload.data && payload.data.event) {
        const { event: pushEvent, detail } = payload.data as unknown as PushedEvent
        const busEvent = `background:${pushEvent}` as keyof BusEventCallbackSignatures
        this.#bus.emit(busEvent, { local: true }, detail)
      }
    })
    this.#booted.value = true
    debug('Booted')
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

  #doUpdates(first: boolean = false) {
    if (!this.#ls.loaded) {
      if (first) {
        this.#ls.promise.then(() => {
          this.#doUpdates(first)
        })
      }
      return
    }
    const registration = this.#ls.get('push.serviceworker.registration') as
      | ServiceWorkerRegistration
      | undefined
    if (registration) {
      this.#serviceWorkerRegistration.value = registration
    }
    const doNotAskForPermission = this.#ls.get('push.donotaskforpermission') || false
    this.#doNotAskForPermissionPreference.value = doNotAskForPermission
    this.#pushPermission.value = Push.Permission.get()
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
}
