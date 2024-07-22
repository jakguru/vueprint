/**
 * @module @jakguru/vueprint/pwa/worker
 */
import { BusService } from '../services/bus'
import { getDebugger } from '../utilities/debug'
import { ref } from 'vue'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { onMessage } from 'firebase/messaging'
import type {
  BusEvent,
  BusEventListenOptions,
  BusEventCallback,
  PushSubscriptionChangeEvent,
  SyncEvent,
  BackgroundFetchEvent,
  BackgroundFetchClickEvent,
  BackgroundFetchFailEvent,
  BackgroundFetchSuccessEvent,
  CanMakePaymentEvent,
  ContentDeleteEvent,
  CookieChangeEvent,
  PaymentRequestEvent,
  PeriodicSyncEvent,
} from '../services/bus'
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type {
  Messaging,
  Unsubscribe,
  MessagePayload,
  NotificationPayload,
} from 'firebase/messaging/sw'
import type { Ref } from 'vue'

const debug = getDebugger('Service Worker')
const fbug = getDebugger('Firebase', '#1B3A57', '#FFCA28')

export interface ServiceWorkerProviderOptions {
  namespace?: string
  firebase?: Partial<FirebaseOptions>
}

/**
 * The service worker provider acts as a wrapper around the functionality of the service worker to integrate it more closely with your application for functionality such as background messages, push notifications or application updates.
 *
 * ::: tip
 * The Service Worker Provider is meant to be used in the service worker.
 * :::
 *
 * ## Accessing the Service Worker Provider
 *
 * The Service Worker Provider should be imported from `@jakguru/vueprint/pwa/worker`
 *
 * ```typescript
 * import { ServiceWorkerProvider } from '@jakguru/vueprint/pwa/worker'
 * import type { ServiceWorkerProviderOptions } from '@jakguru/vueprint/pwa/worker'
 * ```
 *
 * ## Using the Service Worker Provider
 *
 * ### Configuration
 *
 * The Service Worker Provider constructor accepts 2 arguments: `self` which is an instance of {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope}, and an optional {@link ServiceWorkerProviderOptions} object which has 2 properties:
 *
 * | Key | Type | Description |
 * | --- | --- | --- |
 * | `firebase` | [FirebaseOptions](https://firebase.google.com/docs/reference/js/app.firebaseoptions) | Firebase configuration object. Contains a set of parameters required by services in order to successfully communicate with Firebase server APIs and to associate client data with your Firebase project and Firebase application. |
 * | `namespace` | `string` | The namespace to use in the `broadcast-channel` to ensure that messages are sent and received between tabs |
 *
 * ### Adding Hooks
 *
 * The Service Worker Provider includes an instance of the {@link BusService} under the hood, so you can use the same {@link BusService.on}, {@link BusService.once}, {@link BusService.off}, {@link BusService.emit} and {@link BusService.await} methods which you would normally use with the Bus Service.
 *
 * ### Booting the Service Worker Provider
 *
 * After initializing the Service Worker Provider instance, you will need to call {@link ServiceWorkerProvider.boot | instance.boot()} to activate all of processes.
 *
 * #### Available Service Worker Events
 *
 * | Event | Description | Awaited | Experimental |
 * | --- | --- | --- | --- |
 * | `sw:activate` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/activate_event | activate} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when a {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration | ServiceWorkerRegistration} acquires a new {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/active | ServiceWorkerRegistration.active} worker. | ✅ | |
 * | `sw:install` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event | install} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when a {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration | ServiceWorkerRegistration} acquires a new {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/installing | ServiceWorkerRegistration.installing} worker. | ✅ | |
 * | `sw:fetch` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/fetch_event | fetch} event is fired in the service worker's global scope when the main app thread makes a network request. It enables the service worker to intercept network requests and send customized responses (for example, from a local cache). | ✅ | |
 * | `sw:message` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/message_event | message} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface occurs when incoming messages are received. Controlled pages can use the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/postMessage | ServiceWorker.postMessage()} method to send messages to service workers. The service worker can optionally send a response back via the {@link https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage | Client.postMessage()}, corresponding to the controlled page. | ✅ | |
 * | `sw:messageerror` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/messageerror_event | messageerror} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface occurs when incoming messages can't be deserialized. | | |
 * | `sw:notificationclick` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event | notificationclick} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired to indicate that a system notification spawned by {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification | ServiceWorkerRegistration.showNotification(}) has been clicked. | ✅ | |
 * | `sw:notificationclose` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclose_event | notificationclose} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface fires when a user closes a displayed notification spawned by {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification | ServiceWorkerRegistration.showNotification()}. | ✅ | |
 * | `sw:push` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event | push} event is sent to a service worker's global scope (represented by the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface) when the service worker has received a push message. | ✅ | |
 * | `sw:pushsubscriptionchange` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/pushsubscriptionchange_event | pushsubscriptionchange} event is sent to the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | global scope} of a {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker | ServiceWorker} to indicate a change in push subscription that was triggered outside the application's control. | ✅ | |
 * | `sw:sync` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/sync_event | sync} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when the page (or worker) that registered the event with the SyncManager is running and as soon as network connectivity is available. | ✅ | |
 * | `sw:backgroundfetchabort` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/backgroundfetchabort_event | backgroundfetchabort} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when the user or the app itself cancels a background fetch operation. | ✅ | ✅ |
 * | `sw:backgroundfetchclick` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/backgroundfetchclick_event | backgroundfetchclick} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when the user clicks on the UI that the browser provides to show the user the progress of the background fetch operation. | ✅ | ✅ |
 * | `sw:backgroundfetchfail` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/backgroundfetchfail_event | backgroundfetchfail} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when a background fetch operation has failed: that is, when at least one network request in the fetch has failed to complete successfully. | ✅ | ✅ |
 * | `sw:backgroundfetchsuccess` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/backgroundfetchsuccess_event | backgroundfetchsuccess} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when a background fetch operation has completed successfully: that is, when all network requests in the fetch have completed successfully. | ✅ | ✅ |
 * | `sw:canmakepayment` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/canmakepayment_event | canmakepayment} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired on a payment app's service worker to check whether it is ready to handle a payment. Specifically, it is fired when the merchant website calls new PaymentRequest(). | ✅ | ✅ |
 * | `sw:contentdelete` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/contentdelete_event | contentdelete} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when an item is removed from the indexed content via the user agent. | ✅ | ✅ |
 * | `sw:cookiechange` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/cookiechange_event | cookiechange} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired when a cookie change occurs that matches the service worker's cookie change subscription list. | ✅ | ✅ |
 * | `sw:paymentrequest` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/paymentrequest_event | paymentrequest} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired on a payment app when a payment flow has been initiated on the merchant website via the PaymentRequest.show() method. | ✅ | ✅ |
 * | `sw:periodicsync` | The {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/periodicsync_event | periodicsync} event of the {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope | ServiceWorkerGlobalScope} interface is fired at timed intervals, specified when registering a PeriodicSyncManager. | ✅ | ✅ |
 *
 * ## Practical Example
 *
 * ```typescript
 * import { ServiceWorkerProvider } from '@jakguru/vueprint/pwa/worker'
 * import type { ServiceWorkerProviderOptions } from '@jakguru/vueprint/pwa/worker'
 * import type { FirebaseOptions } from 'firebase/app'
 *
 * declare global {
 *   interface ImportMeta {
 *     env: Record<string, string>
 *   }
 * }
 *
 * declare const self: ServiceWorkerGlobalScope & typeof globalThis
 *
 * const firebase: FirebaseOptions = {
 *   apiKey: import.meta.env.VITE_FCM_CONFIG_API_KEY || '',
 *   authDomain: import.meta.env.VITE_FCM_CONFIG_AUTH_DOMAIN || '',
 *   projectId: import.meta.env.VITE_FCM_CONFIG_PROJECT_ID || '',
 *   storageBucket: import.meta.env.VITE_FCM_CONFIG_STORAGE_BUCKET || '',
 *   messagingSenderId: import.meta.env.VITE_FCM_CONFIG_MESSAGING_SENDER_ID || '',
 *   appId: import.meta.env.VITE_FCM_CONFIG_APP_ID || '',
 *   measurementId: import.meta.env.VITE_FCM_CONFIG_MEASUREMENT_ID || '',
 * }
 *
 * const options: ServiceWorkerProviderOptions = {
 *   namespace: import.meta.env.VITE_APP_NAMESPACE,
 *   firebase,
 * }
 *
 * const instance = new ServiceWorkerProvider(self, options)
 * instance.boot()
 * ```
 */
export class ServiceWorkerProvider {
  readonly #self: ServiceWorkerGlobalScope
  readonly #bus: BusService
  readonly #booted: Ref<boolean>
  readonly #firebaseApp: FirebaseApp | undefined
  readonly #firebaseMessaging: Messaging | undefined
  readonly #firebaseOnMessageUnsubscribe: Ref<Unsubscribe | undefined>
  readonly #firebaseOnBackgroundMessageUnsubscribe: Ref<Unsubscribe | undefined>

  /**
   * Create a new Service Worker Provider instance.
   * @param self The service worker's global scope
   * @param options The options to be used by the service worker provider
   */
  constructor(self: ServiceWorkerGlobalScope, options?: ServiceWorkerProviderOptions) {
    this.#self = self
    this.#bus = new BusService(options && options.namespace ? options.namespace : 'vueprint')
    this.#booted = ref(false)
    this.#firebaseOnMessageUnsubscribe = ref(undefined)
    this.#firebaseOnBackgroundMessageUnsubscribe = ref(undefined)
    if (
      options &&
      options.firebase &&
      options.firebase.apiKey &&
      options.firebase.authDomain &&
      options.firebase.projectId &&
      options.firebase.messagingSenderId &&
      options.firebase.appId
    ) {
      try {
        this.#firebaseApp = initializeApp(options.firebase)
        fbug('Firebase app initialized')
      } catch (error) {
        fbug('Firebase app failed to initialize', error)
      }
    } else {
      fbug('Firebase app not initialized')
    }
    if (this.#firebaseApp) {
      try {
        this.#firebaseMessaging = getMessaging(this.#firebaseApp)
        fbug('Firebase messaging initialized')
      } catch (error) {
        fbug('Firebase messaging failed to initialize', error)
      }
    } else {
      fbug('Firebase messaging not initialized')
    }
    this.once('sw:install', async () => {
      debug('Trying to skip waiting')
      this.#self.skipWaiting()
    })
    this.once('sw:activate', async (event) => event.waitUntil(this.#self.clients.claim()))
    debug('Initialized')
  }

  /**
   * The service worker's global scope
   */
  public get self() {
    return this.#self
  }

  /**
   * Exposes the {@link BusService.on} method
   */
  public get on() {
    return this.#bus.on.bind(this.#bus)
  }

  /**
   * Exposes the {@link BusService.off} method
   */
  public get off() {
    return this.#bus.off.bind(this.#bus)
  }

  /**
   * Exposes the {@link BusService.once} method
   */
  public get once() {
    return this.#bus.once.bind(this.#bus)
  }

  /**
   * Trigger an event
   * @param event The name of the event to emit
   * @param options The options for emitting the event
   * @param args The arguments to pass to the event callback
   */
  public emit<K extends BusEvent>(
    event: K,
    options: BusEventListenOptions = {},
    ...args: Parameters<BusEventCallback<K>>
  ) {
    if (options.local) {
      this.#bus.emit(event as BusEvent, options, ...args)
    }
    if (options.crossTab) {
      this.#self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            messageType: 'sw-received',
            data: { event, args, from: 'service-worker' },
          })
        })
      })
    }
  }

  /**
   * Exposes the {@link BusService.await} method
   */
  public async await<K extends BusEvent>(
    event: K,
    options: BusEventListenOptions = {},
    ...args: Parameters<BusEventCallback<K>>
  ) {
    return this.#bus.await(event as BusEvent, options, ...args)
  }

  /**
   * Boot the service worker provider
   */
  public boot() {
    if (this.#booted.value) {
      return
    }
    debug('Booting')
    this.#self.addEventListener('activate', this.#onSwActivate.bind(this))
    this.#self.addEventListener('install', this.#onSwInstall.bind(this))
    this.#self.addEventListener('fetch', this.#onSwFetch.bind(this))
    this.#self.addEventListener('message', this.#onSwMessage.bind(this))
    this.#self.addEventListener('messageerror', this.#onSwMessageerror.bind(this))
    this.#self.addEventListener('notificationclick', this.#onSwNotificationclick.bind(this))
    this.#self.addEventListener('notificationclose', this.#onSwNotificationclose.bind(this))
    this.#self.addEventListener('push', this.#onSwPush.bind(this))
    this.#self.addEventListener(
      'pushsubscriptionchange',
      this.#onSwPushsubscriptionchange.bind(this)
    )
    this.#self.addEventListener('sync', this.#onSwSync.bind(this))
    this.#self.addEventListener('backgroundfetchabort', this.#onSwBackgroundfetchabort.bind(this))
    this.#self.addEventListener('backgroundfetchclick', this.#onSwBackgroundfetchclick.bind(this))
    this.#self.addEventListener('backgroundfetchfail', this.#onSwBackgroundfetchfail.bind(this))
    this.#self.addEventListener(
      'backgroundfetchsuccess',
      this.#onSwBackgroundfetchsuccess.bind(this)
    )
    this.#self.addEventListener('canmakepayment', this.#onSwCanmakepayment.bind(this))
    this.#self.addEventListener('contentdelete', this.#onSwContentdelete.bind(this))
    this.#self.addEventListener('cookiechange', this.#onSwCookiechange.bind(this))
    this.#self.addEventListener('paymentrequest', this.#onSwPaymentrequest.bind(this))
    this.#self.addEventListener('periodicsync', this.#onSwPeriodicsync.bind(this))
    if (this.#firebaseMessaging) {
      this.#firebaseOnMessageUnsubscribe.value = onMessage(
        this.#firebaseMessaging,
        this.#onFcmMessage.bind(this, false)
      )
      this.#firebaseOnBackgroundMessageUnsubscribe.value = onBackgroundMessage(
        this.#firebaseMessaging,
        this.#onFcmMessage.bind(this, true)
      )
    }
    this.#booted.value = true
    debug('Booted and Ready')
  }

  public shutdown() {
    if (!this.#booted.value) {
      return
    }
    debug('Shutting Down')
    this.#self.removeEventListener('activate', this.#onSwActivate.bind(this))
    this.#self.removeEventListener('install', this.#onSwInstall.bind(this))
    this.#self.removeEventListener('fetch', this.#onSwFetch.bind(this))
    this.#self.removeEventListener('message', this.#onSwMessage.bind(this))
    this.#self.removeEventListener('messageerror', this.#onSwMessageerror.bind(this))
    this.#self.removeEventListener('notificationclick', this.#onSwNotificationclick.bind(this))
    this.#self.removeEventListener('notificationclose', this.#onSwNotificationclose.bind(this))
    this.#self.removeEventListener('push', this.#onSwPush.bind(this))
    this.#self.removeEventListener(
      'pushsubscriptionchange',
      this.#onSwPushsubscriptionchange.bind(this)
    )
    this.#self.removeEventListener('sync', this.#onSwSync.bind(this))
    this.#self.removeEventListener(
      'backgroundfetchabort',
      this.#onSwBackgroundfetchabort.bind(this)
    )
    this.#self.removeEventListener(
      'backgroundfetchclick',
      this.#onSwBackgroundfetchclick.bind(this)
    )
    this.#self.removeEventListener('backgroundfetchfail', this.#onSwBackgroundfetchfail.bind(this))
    this.#self.removeEventListener(
      'backgroundfetchsuccess',
      this.#onSwBackgroundfetchsuccess.bind(this)
    )
    this.#self.removeEventListener('canmakepayment', this.#onSwCanmakepayment.bind(this))
    this.#self.removeEventListener('contentdelete', this.#onSwContentdelete.bind(this))
    this.#self.removeEventListener('cookiechange', this.#onSwCookiechange.bind(this))
    this.#self.removeEventListener('paymentrequest', this.#onSwPaymentrequest.bind(this))
    this.#self.removeEventListener('periodicsync', this.#onSwPeriodicsync.bind(this))
    if (this.#firebaseOnMessageUnsubscribe.value) {
      this.#firebaseOnMessageUnsubscribe.value()
    }
    if (this.#firebaseOnBackgroundMessageUnsubscribe.value) {
      this.#firebaseOnBackgroundMessageUnsubscribe.value()
    }
    this.#booted.value = false
    debug('All Cleaned Up')
  }

  #onFcmMessage(background: boolean, payload: MessagePayload, ...args: any[]) {
    fbug('Incoming Message:', { background, payload, args })
    this.emit(
      'on:fcm:message',
      {
        local: true,
        crossTab: true,
      },
      background,
      payload,
      args
    )
  }

  #onSwActivate(event: ExtendableEvent) {
    debug('Observed "activate"', event)
    event.waitUntil(this.await('sw:activate', { local: true, crossTab: true }, event))
  }

  #onSwInstall(event: ExtendableEvent) {
    debug('Observed "install"', event)
    event.waitUntil(this.await('sw:install', { local: true, crossTab: true }, event))
  }

  #onSwFetch(event: FetchEvent) {
    event.waitUntil(this.await('sw:fetch', { local: true, crossTab: true }, event))
  }

  #onSwMessage(event: ExtendableMessageEvent) {
    if (event.data && event.data.type && event.data.type === 'SKIP_WAITING') {
      debug('Received "SKIP_WAITING" message')
      this.#self.skipWaiting()
      return
    }
    debug('Observed "message"', event)
    event.waitUntil(this.await('sw:message', { local: true, crossTab: true }, event))
  }

  #onSwMessageerror(event: MessageEvent) {
    debug('Observed "messageerror"', event)
    this.emit('sw:messageerror', { local: true }, event)
  }

  #onSwNotificationclick(event: NotificationEvent) {
    debug('Observed "notificationclick"', event)
    event.waitUntil(this.await('sw:notificationclick', { local: true, crossTab: true }, event))
  }

  #onSwNotificationclose(event: NotificationEvent) {
    debug('Observed "notificationclose"', event)
    event.waitUntil(this.await('sw:notificationclose', { local: true, crossTab: true }, event))
  }

  #onSwPush(event: PushEvent) {
    debug('Observed "push"', event)
    event.waitUntil(this.await('sw:push', { local: true, crossTab: true }, event))
  }

  #onSwPushsubscriptionchange(event: Event) {
    debug('Observed "pushsubscriptionchange"', event)
    const e: PushSubscriptionChangeEvent = event as PushSubscriptionChangeEvent
    e.waitUntil(this.await('sw:pushsubscriptionchange', { local: true, crossTab: true }, e))
  }

  #onSwSync(event: Event) {
    debug('Observed "sync"', event)
    const e: SyncEvent = event as SyncEvent
    e.waitUntil(this.await('sw:sync', { local: true, crossTab: true }, e))
  }

  #onSwBackgroundfetchabort(event: Event) {
    debug('Observed "backgroundfetchabort"', event)
    const e: BackgroundFetchEvent = event as BackgroundFetchEvent
    e.waitUntil(this.await('sw:backgroundfetchabort', { local: true, crossTab: true }, e))
  }

  #onSwBackgroundfetchclick(event: Event) {
    debug('Observed "backgroundfetchclick"', event)
    const e: BackgroundFetchClickEvent = event as BackgroundFetchClickEvent
    e.waitUntil(this.await('sw:backgroundfetchclick', { local: true, crossTab: true }, e))
  }

  #onSwBackgroundfetchfail(event: Event) {
    debug('Observed "backgroundfetchfail"', event)
    const e: BackgroundFetchFailEvent = event as BackgroundFetchFailEvent
    e.waitUntil(this.await('sw:backgroundfetchfail', { local: true, crossTab: true }, e))
  }

  #onSwBackgroundfetchsuccess(event: Event) {
    debug('Observed "backgroundfetchsuccess"', event)
    const e: BackgroundFetchSuccessEvent = event as BackgroundFetchSuccessEvent
    e.waitUntil(this.await('sw:backgroundfetchsuccess', { local: true, crossTab: true }, e))
  }

  #onSwCanmakepayment(event: Event) {
    debug('Observed "canmakepayment"', event)
    const e: CanMakePaymentEvent = event as CanMakePaymentEvent
    e.waitUntil(this.await('sw:canmakepayment', { local: true, crossTab: true }, e))
  }

  #onSwContentdelete(event: Event) {
    debug('Observed "contentdelete"', event)
    const e: ContentDeleteEvent = event as ContentDeleteEvent
    e.waitUntil(this.await('sw:contentdelete', { local: true, crossTab: true }, e))
  }

  #onSwCookiechange(event: Event) {
    debug('Observed "cookiechange"', event)
    const e: CookieChangeEvent = event as CookieChangeEvent
    e.waitUntil(this.await('sw:cookiechange', { local: true, crossTab: true }, e))
  }

  #onSwPaymentrequest(event: Event) {
    debug('Observed "paymentrequest"', event)
    const e: PaymentRequestEvent = event as PaymentRequestEvent
    e.waitUntil(this.await('sw:paymentrequest', { local: true, crossTab: true }, e))
  }

  #onSwPeriodicsync(event: Event) {
    debug('Observed "periodicsync"', event)
    const e: PeriodicSyncEvent = event as PeriodicSyncEvent
    e.waitUntil(this.await('sw:periodicsync', { local: true, crossTab: true }, e))
  }
}
