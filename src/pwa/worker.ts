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
  namespace: string
  firebase: Partial<FirebaseOptions>
}

export class ServiceWorkerProvider {
  readonly #self: ServiceWorkerGlobalScope
  readonly #bus: BusService
  readonly #booted: Ref<boolean>
  readonly #firebaseApp: FirebaseApp | undefined
  readonly #firebaseMessaging: Messaging | undefined
  readonly #firebaseOnMessageUnsubscribe: Ref<Unsubscribe | undefined>
  readonly #firebaseOnBackgroundMessageUnsubscribe: Ref<Unsubscribe | undefined>

  constructor(self: ServiceWorkerGlobalScope, options?: ServiceWorkerProviderOptions) {
    this.#self = self
    this.#bus = new BusService(options && options.namespace ? options.namespace : 'vueprint')
    this.#booted = ref(false)
    this.#firebaseOnMessageUnsubscribe = ref(undefined)
    this.#firebaseOnBackgroundMessageUnsubscribe = ref(undefined)
    if (options && options.firebase) {
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

  public get self() {
    return this.#self
  }

  public get on() {
    return this.#bus.on.bind(this.#bus)
  }

  public get off() {
    return this.#bus.off.bind(this.#bus)
  }

  public get once() {
    return this.#bus.once.bind(this.#bus)
  }

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

  public get await() {
    return this.#bus.await.bind(this.#bus)
  }

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
    if (background && payload.notification) {
      const { body, icon, image, title } = payload.notification as NotificationPayload
      const notificationTitle = title || body
      if (notificationTitle) {
        return this.#self.registration.showNotification(notificationTitle, {
          badge: icon,
          body,
          icon,
          image,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: payload.collapseKey,
        })
      }
    }
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
