import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import type { Messaging, Unsubscribe } from 'firebase/messaging'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import Push from 'push.js'
import type { ComputedRef, Ref, WatchStopHandle } from 'vue/'
import { computed, ref, watch } from 'vue/'
import type { Bus, BusEventCallbackSignatures } from './bus'
import { getDebugger } from './debug'
import type { LocalStorage } from './localStorage'
// import type { Identity } from './identity'
import type { MiliCron } from '@jakguru/milicron'
import type { Axios } from 'axios'

const debug = getDebugger('Push')
const fbug = getDebugger('Firebase', '#1B3A57', '#FFCA28')
const sbug = getDebugger('Service Worker', '#000000', '#FFFFFF')

type PushPermission =
  | typeof Push.Permission.GRANTED
  | typeof Push.Permission.DENIED
  | typeof Push.Permission.DEFAULT

export interface PushedEvent {
  event:
    | 'customer:login'
    | 'customer:login:first'
    | 'evidence:updated'
    | 'pii:updated'
    | 'profile:updated'
    | 'rejected:evidence'
    | 'rejected:rsaid'
    | 'rsaid:rejected:mismatch'
    | 'docfox:rsaid:rejected'
    | 'updated:poi'
    | 'docfox:application:create:failed'
    | 'evidence:rejected'
  detail?: any
}

export class PushService {
  readonly #booted: Ref<boolean>
  readonly #bus: Bus
  readonly #ls: LocalStorage
  readonly #cron: MiliCron
  readonly #api: Axios
  // readonly #identity: Identity
  readonly #firebaseApp: FirebaseApp
  readonly #firebaseMessaging: Messaging
  readonly #serviceWorkerRegistration: Ref<ServiceWorkerRegistration | undefined>
  readonly #serviceWorkerRegistrationToken: Ref<string | undefined>
  readonly #pushPermission: Ref<PushPermission | undefined>
  readonly #doNotAskForPermissionPreference: Ref<boolean | undefined>
  readonly #canRequestPermission: ComputedRef<boolean>
  readonly #canPush: ComputedRef<boolean | null>
  #serviceWorkerRegistrationWatchStopHandle: WatchStopHandle | undefined
  #serviceWorkerRegistrationTokenWatchStopHandle: WatchStopHandle | undefined
  #pushPermissionWatchStopHandle: WatchStopHandle | undefined
  #doNotAskForPermissionPreferenceWatchStopHandle: WatchStopHandle | undefined
  #identityAuthenticatedWatchStopHandle: WatchStopHandle | undefined
  #apiFirebaseOperationAbortController: AbortController | undefined
  #fcmOnMessageUnsubscribe: Unsubscribe | undefined

  constructor(
    bus: Bus,
    ls: LocalStorage,
    cron: MiliCron,
    api: Axios,
    // identity: Identity,
    firebaseOptions: FirebaseOptions
  ) {
    this.#booted = ref(false)
    this.#bus = bus
    this.#ls = ls
    this.#cron = cron
    this.#api = api
    // this.#identity = identity
    this.#serviceWorkerRegistration = ref(undefined)
    this.#serviceWorkerRegistrationToken = ref(undefined)
    this.#pushPermission = ref(undefined)
    this.#doNotAskForPermissionPreference = ref(undefined)
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

  public get booted() {
    return this.#booted
  }

  public get canRequestPermission() {
    return this.#canRequestPermission
  }

  public get canPush() {
    return this.#canPush
  }

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

  public doNotRequestPushPermission() {
    if (this.canPush.value) {
      return
    }
    this.#ls.set('push.donotaskforpermission', true)
    this.#bus.emit('push:updated', { local: true, crossTab: true })
  }

  public $resetDoNotRequestPushPermissionPreference() {
    this.#ls.remove('push.donotaskforpermission')
    this.#bus.emit('push:updated', { local: true, crossTab: true })
  }

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
    // this.#identityAuthenticatedWatchStopHandle = watch(
    //   () => this.#identity.authenticated.value,
    //   (is, was) => {
    //     if (was === is) {
    //       return
    //     }
    //     this.#updateApiAboutFirebase()
    //   },
    //   {
    //     immediate: true,
    //     deep: true,
    //   }
    // )
    this.#cron.$on('*/250 * * * * *', this.#update.bind(this))
    this.#bus.on('push:updated', this.#update.bind(this), { local: true, crossTab: true })
    this.#doUpdates(true)
    if ('undefined' !== typeof window && 'serviceWorker' in navigator) {
      if ('undefined' === typeof this.#serviceWorkerRegistration.value) {
        // const path =
        //   'production' === import.meta.env.MODE ? '/firebase-messaging-sw.js' : '/dev-sw.js?dev-sw'
        // const mode = 'production' === import.meta.env.MODE ? 'classic' : 'module'
        // debug('Attempting to register Service Worker', { path, mode })
        // navigator.serviceWorker
        //   .register(path, { type: mode })
        //   .then((registration) => {
        //     sbug('Service Worker Registered', registration)
        //     this.#serviceWorkerRegistration.value = registration
        //   })
        //   .catch((error) => {
        //     sbug('Service Worker Registration Failed', error)
        //   })
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
      // const is = this.#identity.authenticated.value
      if (this.#apiFirebaseOperationAbortController) {
        this.#apiFirebaseOperationAbortController.abort()
      }
      this.#apiFirebaseOperationAbortController = new AbortController()
      try {
        // if (is) {
        //   fbug('Registering Firebase Messaging Token with API')
        //   this.#api
        //     .post('/push/create', {
        //       token: this.#serviceWorkerRegistrationToken.value,
        //     })
        //     .then(() => {
        //       fbug('Registered Firebase Messaging Token with API')
        //     })
        //     .catch((error) => {
        //       if (error instanceof Error && error.name !== 'CancelError') {
        //         fbug('Failed to register Firebase Messaging Token with API', error)
        //       }
        //     })
        // } else {
        //   fbug('Unregistering Firebase Messaging Token with API')
        //   this.#api
        //     .post('/push/destroy', {
        //       token: this.#serviceWorkerRegistrationToken.value,
        //     })
        //     .then(() => {
        //       fbug('Unregistered Firebase Messaging Token with API')
        //     })
        //     .catch((error) => {
        //       if (error instanceof Error && error.name !== 'CancelError') {
        //         fbug('Failed to unregister Firebase Messaging Token with API', error)
        //       }
        //     })
        // }
      } catch (error) {
        if (error instanceof Error && error.name !== 'CancelError') {
          fbug('API Firebase Operation threw and Error', error)
        }
      }
    }
  }
}
