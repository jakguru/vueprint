/**
 * @module @jakguru/vueprint/services/bus
 */
import type { NotificationPayload, MessagePayload } from 'firebase/messaging'
import type { Ref } from 'vue'
import type { UserIdentity } from './identity'
import { TinyEmitter } from 'tiny-emitter'
import { computed, ref } from 'vue'
import { getDebugger } from '../utilities/debug'
const debug = getDebugger('Bus')

interface BackgroundFetchRegistration {
  id: string
  uploadTotal: number
  uploaded: number
  downloadTotal: number
  downloaded: number
  result: 'pending' | 'success' | 'failure'
  failureReason:
    | 'none'
    | 'aborted'
    | 'bad-status'
    | 'fetch-error'
    | 'quota-exceeded'
    | 'download-total-exceeded'
  recordsAvailable: boolean

  match(
    request: Request | string,
    options?: BackgroundFetchMatchOptions
  ): Promise<Response | undefined>
  matchAll(request?: Request | string, options?: BackgroundFetchMatchOptions): Promise<Response[]>
  unregister(): Promise<boolean>
}

export interface BackgroundFetchMatchOptions {
  ignoreSearch?: boolean
  ignoreMethod?: boolean
  ignoreVary?: boolean
}

export interface BackgroundFetchSettledFetch {
  request: Request
  response: Response | null
}

export interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires: number
  size: number
  httpOnly: boolean
  secure: boolean
  session: boolean
  sameSite: 'Strict' | 'Lax' | 'None'
}

export interface PushSubscriptionChangeEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly newSubscription: PushSubscription | null
  readonly oldSubscription: PushSubscription | null
}

export interface SyncEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly tag: string
  readonly lastChance: boolean
}

export interface BackgroundFetchEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly id: string
  readonly registration: BackgroundFetchRegistration
}

export interface BackgroundFetchClickEvent extends BackgroundFetchEvent {}

export interface BackgroundFetchFailEvent extends BackgroundFetchEvent {
  readonly fetches: BackgroundFetchSettledFetch[]
}

export interface BackgroundFetchSuccessEvent extends BackgroundFetchEvent {
  readonly fetches: BackgroundFetchSettledFetch[]
}

export interface CanMakePaymentEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  respondWith(response: Promise<boolean>): void
}

export interface ContentDeleteEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly id: string
}

export interface CookieChangeEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly changed: ReadonlyArray<Cookie>
  readonly deleted: ReadonlyArray<Cookie>
}

export interface PaymentRequestEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly topOrigin: string
  readonly paymentRequestOrigin: string
  readonly paymentRequestId: string
  readonly methodData: PaymentMethodData[]
  readonly total: PaymentCurrencyAmount
  readonly instrumentKey: string
  respondWith(response: Promise<PaymentResponse>): void
}

export interface PeriodicSyncEvent extends ExtendableEvent {
  waitUntil(f: Promise<any>): void
  readonly tag: string
}

type EventFrom = 'service-worker' | string

/**
 * Describes the events and the signatures of their callbacks
 * Should be extended by the application to include all the events it needs
 */
export interface BusEventCallbackSignatures {
  /**
   * Emitted when the API returns a 401 Unauthorized status
   * @param from The ID of the tab that triggered the event
   */
  'api:unauthorized': (from?: EventFrom) => void
  /**
   * A tab has been updated
   * @param uuid The ID of the tab which has been updated
   * @param active If the new tab is "active" or not
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'tab:uuid': (uuid: string, active: boolean, from?: EventFrom) => void
  /**
   * A tab has become active
   * @param from The ID of the tab that triggered the event
   */
  'tab:active': (from?: EventFrom) => void
  /**
   * A tab has become inactive
   * @param from The ID of the tab that triggered the event
   */
  'tab:inactive': (from?: EventFrom) => void
  /**
   * The push service has been updated
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:updated': (from?: EventFrom) => void
  /**
   * The push service has been granted permission
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:permission:denied': (from?: EventFrom) => void
  /**
   * The push service has been denied permission
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:permission:granted': (from?: EventFrom) => void
  /**
   * A push notification has been received
   * @param payload The payload of the notification
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:notification': (payload: NotificationPayload, from?: EventFrom) => void
  /**
   * The Firebase token has been updated
   * @param token The new token
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'firebase:token:updated': (token: string | undefined, from?: EventFrom) => void
  /**
   * The user has been authenticated and identified
   * @param bearer The bearer token
   * @param expiration The expiration date of the token
   * @param identity The identity of the user
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'identity:login': (
    bearer: string,
    expiration: string,
    identity: UserIdentity,
    from?: EventFrom
  ) => void
  /**
   * The user has been logged out
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'identity:logout': (from?: EventFrom) => void
  /**
   * The user's authentication token is eligible for refresh
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'authentication:refreshable': (from?: EventFrom) => void
  /**
   * Notify that the local storage has changed
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'ls:change': (from?: EventFrom) => void
  /**
   * Notify that the local storage has been loaded
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'ls:loaded': (from?: EventFrom) => void
  /**
   * Notify that the local storage has been saved
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'ls:setDataToLocalStorage': (key, data, from?: EventFrom) => void
  /**
   * Notify that the local storage has been cleared
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'ls:clear': (from?: EventFrom) => void
  /**
   * Notify that the local storage has been reset
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'ls:resetAllKeys': (from?: EventFrom) => void
  'sw:activate': (event: ExtendableEvent, from?: EventFrom) => void
  'sw:install': (event: ExtendableEvent, from?: EventFrom) => void
  'sw:fetch': (event: FetchEvent, from?: EventFrom) => void
  'sw:message': (event: ExtendableMessageEvent, from?: EventFrom) => void
  'sw:messageerror': (event: MessageEvent, from?: EventFrom) => void
  'sw:notificationclick': (event: NotificationEvent, from?: EventFrom) => void
  'sw:notificationclose': (event: NotificationEvent, from?: EventFrom) => void
  'sw:push': (event: PushEvent, from?: EventFrom) => void
  'sw:pushsubscriptionchange': (event: PushSubscriptionChangeEvent, from?: EventFrom) => void
  'sw:sync': (event: SyncEvent, from?: EventFrom) => void
  'sw:backgroundfetchabort': (event: BackgroundFetchEvent, from?: EventFrom) => void
  'sw:backgroundfetchclick': (event: BackgroundFetchClickEvent, from?: EventFrom) => void
  'sw:backgroundfetchfail': (event: BackgroundFetchFailEvent, from?: EventFrom) => void
  'sw:backgroundfetchsuccess': (event: BackgroundFetchSuccessEvent, from?: EventFrom) => void
  'sw:canmakepayment': (event: CanMakePaymentEvent, from?: EventFrom) => void
  'sw:contentdelete': (event: ContentDeleteEvent, from?: EventFrom) => void
  'sw:cookiechange': (event: CookieChangeEvent, from?: EventFrom) => void
  'sw:paymentrequest': (event: PaymentRequestEvent, from?: EventFrom) => void
  'sw:periodicsync': (event: PeriodicSyncEvent, from?: EventFrom) => void
  'webfonts:loading': (from?: EventFrom) => void
  'webfonts:active': (from?: EventFrom) => void
  'webfonts:inactive': (from?: EventFrom) => void
  'push:firebase:message': (payload: MessagePayload, from?: EventFrom) => void
}

/**
 * The events that can be emitted and listened to
 */
export type BusEvent = keyof BusEventCallbackSignatures

/**
 * The callback signatures for the events
 */
export type BusEventCallback<T extends keyof BusEventCallbackSignatures> =
  BusEventCallbackSignatures[T]

/**
 * The events that have already been triggered
 */
export type BusEventAlreadyTriggered = {
  [key in keyof BusEventCallbackSignatures]: Parameters<BusEventCallback<key>>
}

/**
 * Options for listening to events
 * @param local - Emit and listen to events in the same tab
 * @param crossTab - Emit and listen to events in other tabs
 * @param immediate - If the event has already been triggered, trigger it immediately
 */
export interface BusEventListenOptions {
  local?: boolean
  crossTab?: boolean
  immediate?: boolean
}

/**
 * Options for emitting events
 * @inheritdoc BusEventListenOptions
 */
export type BusEventEmitOptions = Omit<BusEventListenOptions, 'immediate'>

/**
 * Generate a likely unique short ID for identifying tabs
 * @returns A short ID
 */
export function shortid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Extend the TinyEmitter class type
declare class TinyEmitterWithEvents extends TinyEmitter {
  public e: Record<BusEvent, { ctx: unknown; fn: BusEventCallback<BusEvent> }[]>
}

/**
 * The bus service is a service which allows event-based communication between components, tabs and services. It offers an API similar to the [NodeJS EventEmitter](https://nodejs.org/docs/latest-v18.x/api/events.html#class-eventemitter) class.
 * @remarks
 *
 * ## Accessing the Bus Service
 *
 * The Bus Service is both injectable and accessible from the global `Vue` instance:
 *
 * ```vue
 *
 * <script lang="ts">
 * import { defineComponent, inject } from 'vue'
 * import type { BusService } from '@jakguru/vueprint'
 * export default defineComponent({
 *     setup() {
 *         const bus = inject<BusService>('bus')
 *         return {}
 *     }
 *     mounted() {
 *         const bus: BusService = this.config.globalProperties.$bus
 *     }
 * })
 * </script>
 * ```
 *
 * ## Using the Bus Service
 *
 * ### Triggering an Event
 *
 * To trigger an event, simply use the {@link BusService.emit} method, where the first argument is the event that you are triggering, the second argument are the {@link BusEventListenOptions} used to determine where an event is triggered to, and the remaining arguments are the arguments which will be passed to the listening callbacks.
 *
 * ```typescript
 * bus.emit(
 *     'some-custom-event',
 *     { crossTab: true, local: true },
 *     customArg1,
 *     customArg2
 * )
 * ```
 *
 * ### Listening to an Event
 *
 * To listen to an event, you can use the {@link BusService.on} and {@link BusService.once} methods, where the first argument is the event that you are listening to, the second argument is the callback which will be triggered when the event occurs, and the last argument is the {@link BusEventListenOptions} used to determine the scope of events to subscribe to.
 *
 * ```typescript
 * const someEventCallback = (arg1, arg2, from) => {
 *     // do something here
 * }
 *
 * bus.on(
 *     'some-custom-event',
 *     someEventCallback,
 *     { crossTab: true, local: true }
 * )
 * ```
 *
 * To remove a callback from the listen of callbacks triggered when an event occurs, you can use {@link BusService.off}, where the first argument is the event that you want to stop listening to, the second argument is the callback which should stop being triggered, and the last argument are the {@link BusEventListenOptions} used to determine the scope of events to unsubscribe from.
 *
 * ### Using Custom Events
 *
 * In order to use custom events in typescript, you will need to add some Typescript Augmentations. For more information, see [Typescript Augmentations](/getting-started/typescript-augmentations)
 *
 * ### Determining if we are currently in the main tab
 *
 * To determine if the current tab is the main tab, the {@link BusService.isMain} method can be used.
 *
 * ### Cross-Tab Requests
 *
 * It is now possible to make requests to other tabs and await their responses. This is done using the {@link BusService.crossTabRequest} and {@link BusService.addRequestHandler} methods.
 */
export class BusService {
  #uuid: string
  #channel?: BroadcastChannel
  #localBus: TinyEmitterWithEvents
  #crossTabBus: TinyEmitterWithEvents
  #requestResponseBus: TinyEmitterWithEvents
  #requestResponseHandlers: Map<string, (payload: any) => unknown | Promise<unknown>>
  #active: Ref<boolean>
  #lastUpdatedAt: Ref<number | undefined>
  #alreadyTriggeredLocalEvents: Ref<Partial<BusEventAlreadyTriggered>>
  #alreadyTriggeredCrossTabEvents: Ref<Partial<BusEventAlreadyTriggered>>

  /**
   * Create a new bus
   * @param namespace The namespace for the BroadcastChannel
   */
  constructor(namespace?: string) {
    this.#uuid = shortid()
    this.#localBus = new TinyEmitter() as TinyEmitterWithEvents
    this.#crossTabBus = new TinyEmitter() as TinyEmitterWithEvents
    this.#requestResponseBus = new TinyEmitter() as TinyEmitterWithEvents
    this.#requestResponseHandlers = new Map()
    this.#active = ref(false)
    this.#lastUpdatedAt = ref(undefined)
    this.#alreadyTriggeredLocalEvents = ref({})
    this.#alreadyTriggeredCrossTabEvents = ref({})
    const origin =
      'undefined' !== typeof window &&
      'object' === typeof window.location &&
      'string' === typeof window.location.origin
        ? window.location.origin
        : 'vueprint'
    if (typeof BroadcastChannel !== 'undefined') {
      this.#channel = new BroadcastChannel(namespace || origin || 'vueprint')
      this.#channel.onmessage = this.#onChannelMessage.bind(this)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.#onWindowFocusChange.bind(this, true))
      window.addEventListener('blur', this.#onWindowFocusChange.bind(this, false))
      window.addEventListener('visibilitychange', this.#onWindowVisibilitychange.bind(this))
      this.#onWindowVisibilitychange()
    }
    this.#addRequestHandler('getActiveTabs', () => this.active.value)
    this.#addRequestHandler('awaitCrossTab', async ({ event, args }) => {
      await this.#awaitLocal(event, args)
    })
    debug(`Initialized Bus for tab ${this.#uuid}`)
  }

  #onChannelMessage(e: MessageEvent<any>) {
    const raw = e.data
    let event: BusEvent
    let args: Parameters<BusEventCallback<BusEvent>> = []
    let from: string
    try {
      const msg = JSON.parse(raw)
      event = msg.event as BusEvent
      args = msg.args as Parameters<BusEventCallback<BusEvent>>
      from = msg.from as string
      // we have to determine if this is a request which requires a response
      if ((event as BusEvent | 'crossTabRequest') === 'crossTabRequest') {
        const [requestId, method, payload, targets] = args as [string, string, any, '*' | string[]]
        if (targets === '*' || targets.includes(this.#uuid)) {
          const handler = this.#requestResponseHandlers.get(method)
          const responsePromise = new Promise(async (resolve) => {
            let response: any
            try {
              response = await handler?.(payload)
            } catch (error) {
              debug(`Error handling crossTabRequest "${method}"`, error)
            }
            resolve(response)
          })
          responsePromise.then((response) => {
            this.#channel!.postMessage(
              JSON.stringify({
                event: 'crossTabResponse',
                args: [requestId, response],
                from: this.#uuid,
              })
            )
          })
        } else {
          return
        }
      }
      // we have to determine if this is a response to a request
      if ((event as BusEvent | 'crossTabResponse') === 'crossTabResponse') {
        const [requestId, response] = args as [string, any]
        this.#requestResponseBus.emit(requestId, response, from)
        return
      }
      this.#crossTabBus.emit(event, ...args, from)
    } catch {
      return
    }
  }

  #onWindowFocusChange(active: boolean) {
    debug(`Tab is ${active ? 'active' : 'inactive'}`)
    this.#active.value = active
    if (!active) {
      delete this.#alreadyTriggeredLocalEvents.value['tab:active']
      this.emit('tab:inactive', { local: true })
      this.#lastUpdatedAt.value = Date.now()
    } else {
      this.#alreadyTriggeredLocalEvents.value['tab:inactive']
      this.emit('tab:active', { local: true })
    }
    this.emit('tab:uuid', { local: false, crossTab: true }, this.#uuid, active)
  }

  #onWindowVisibilitychange() {
    if (typeof document === 'undefined') {
      return
    }
    this.#onWindowFocusChange(document.visibilityState === 'visible')
  }

  /**
   * The UUID of the tab
   */
  public get uuid() {
    return this.#uuid
  }

  /**
   * Whether the tab is active
   */
  public get active() {
    return computed(() => this.#active.value)
  }

  /**
   * Whether the tab has been inactive for too long and should have reduced functionality
   * to save user resources
   */
  public get inactiveTooLong() {
    return computed(() => {
      if (this.#active.value === true || this.#lastUpdatedAt.value === undefined) {
        return false
      }
      return Date.now() - this.#lastUpdatedAt.value > 60000
    })
  }

  /**
   * Listen to an event
   * @param event The event to listen to
   * @param callback The callback to call when the event is emitted
   * @param options The options for listening to the event
   */
  public on<K extends BusEvent>(
    event: K,
    callback: BusEventCallback<K>,
    options: BusEventListenOptions = {}
  ) {
    if (options.local) {
      this.#localBus.on(event as BusEvent, callback)
    }
    if (options.crossTab) {
      this.#crossTabBus.on(event as BusEvent, callback)
    }
    if (options.immediate) {
      let called = false
      const args = this.#alreadyTriggeredLocalEvents.value[event]
        ? (Object.values(this.#alreadyTriggeredLocalEvents.value[event]!) as Parameters<
            BusEventCallback<K>
          >)
        : []
      if (options.local && this.#alreadyTriggeredLocalEvents.value[event]) {
        called = true
        // @ts-ignore
        callback(...args)
      }
      if (options.crossTab && this.#alreadyTriggeredCrossTabEvents.value[event] && !called) {
        called = true
        // @ts-ignore
        callback(...args)
      }
    }
  }

  /**
   * Stop listening to an event
   * @param event The event to stop listening to
   * @param callback The callback to remove from the event
   * @param options The options for stopping listening to the event
   */
  public off<K extends BusEvent>(
    event: K,
    callback: BusEventCallback<K>,
    options: BusEventListenOptions = {}
  ) {
    if (options.local) {
      this.#localBus.off(event as BusEvent, callback)
    }
    if (options.crossTab) {
      this.#crossTabBus.off(event as BusEvent, callback)
    }
  }

  /**
   * Listen to an event once
   * @param event The event to listen to
   * @param callback The callback to call when the event is emitted
   * @param options The options for listening to the event
   */
  public once<K extends BusEvent>(
    event: K,
    callback: BusEventCallback<K>,
    options: BusEventListenOptions = {}
  ) {
    if (options.local) {
      this.#localBus.once(event as BusEvent, callback)
    }
    if (options.crossTab) {
      this.#crossTabBus.once(event as BusEvent, callback)
    }
    if (options.immediate) {
      let called = false
      const args = this.#alreadyTriggeredLocalEvents.value[event]
        ? (Object.values(this.#alreadyTriggeredLocalEvents.value[event]!) as Parameters<
            BusEventCallback<K>
          >)
        : []
      if (options.local && this.#alreadyTriggeredLocalEvents.value[event]) {
        called = true
        // @ts-ignore
        callback(...args)
      }
      if (options.crossTab && this.#alreadyTriggeredCrossTabEvents.value[event] && !called) {
        called = true
        // @ts-ignore
        callback(...args)
      }
    }
  }

  /**
   * Trigger an event
   * @param event The name of the event to emit
   * @param options The options for emitting the event
   * @param args The arguments to pass to the event
   */
  public emit<K extends BusEvent>(
    event: K,
    options: BusEventListenOptions = {},
    ...args: Parameters<BusEventCallback<K>>
  ) {
    if (options.local) {
      this.#localBus.emit(event as BusEvent, ...args)
      // @ts-ignore
      this.#alreadyTriggeredLocalEvents.value[event] = args
    }
    if (options.crossTab) {
      this.#channel?.postMessage(JSON.stringify({ event, args, from: this.#uuid }))
      // @ts-ignore
      this.#alreadyTriggeredCrossTabEvents.value[event] = args
    }
  }

  /**
   * Trigger an event and await for all listeners to process it
   * @param event The name of the event to await listener processing for
   * @param args The arguments to pass to the event
   * @returns A promise that resolves when all listeners have processed the event
   *
   * @remarks
   * This method is especially useful within service workers where you may need to use `event.waitUntil` to ensure that all listeners have processed the event before the service worker is terminated
   */
  public async await<K extends BusEvent>(
    event: K,
    options: BusEventListenOptions = {},
    ...args: Parameters<BusEventCallback<K>>
  ) {
    const promises: Promise<void | void[]>[] = []
    if (options.local) {
      promises.push(this.#awaitLocal(event, args))
    }
    if (options.crossTab) {
      promises.push(this.#awaitCrossTab(event, args))
    }
    if (promises.length) {
      return await Promise.all(promises)
    }
    return await Promise.resolve()
  }

  #awaitLocal<K extends BusEvent>(event: K, args: Parameters<BusEventCallback<K>>) {
    const promises: Promise<void>[] = []
    if (!this.#localBus.e) {
      if (!['sw:fetch'].includes(event)) {
        debug(`No local bus listeners for "${event}"`)
      }
      return Promise.resolve()
    }
    if (this.#localBus.e[event]) {
      this.#localBus.e[event].forEach(({ fn }) => {
        promises.push(Promise.resolve((fn as any).apply(null, args)))
      })
    }
    if (promises.length) {
      return Promise.all(promises)
    }
    return Promise.resolve()
  }

  #awaitCrossTab<K extends BusEvent>(event: K, args: Parameters<BusEventCallback<K>>) {
    return new Promise<void>((resolve) => {
      this.crossTabRequest('awaitCrossTab', { event, args }).then(() => {
        resolve(void 0)
      })
    })
  }

  /**
   * Make a request to all tabs and await their responses
   * @param method The method to call
   * @param payload The payload to send to the method being called
   * @param targets The uuids of the tabs to send the request to. Accepts "*" for all tabs
   * @param timeout The amount of time to wait for a response
   * @returns A map of responses from the tabs
   */
  public async crossTabRequest<ResponseType extends any = any>(
    method: string,
    payload: any,
    targets: '*' | string[] = '*',
    timeout = 500
  ): Promise<Map<string, ResponseType | undefined>> {
    if (!this.#channel) {
      throw new Error('BroadcastChannel is not available')
    }
    const requestId = shortid()
    const requestPayload = JSON.stringify({
      event: 'crossTabRequest',
      args: [requestId, method, payload, targets],
      from: this.#uuid,
    })
    const responses: Map<string, ResponseType | undefined> = new Map()
    const onResponse = (response: ResponseType | undefined, from: string) => {
      responses.set(from, response)
    }
    const promiseForResponses = new Promise((resolve) => {
      this.#requestResponseBus.on(requestId, onResponse)
      setTimeout(resolve, timeout)
    })
    this.#channel.postMessage(requestPayload)
    await promiseForResponses
    this.#requestResponseBus.off(requestId, onResponse)
    return responses
  }

  #addRequestHandler(method: string, handler: (payload: any) => unknown | Promise<unknown>) {
    this.#requestResponseHandlers.set(method, handler)
  }

  /**
   * Add a function which will handle requests for a method called by {@link BusService.crossTabRequest}
   * @param method The method which the handler will handle requests for
   * @param handler The function which will handle requests and return results
   */
  public addRequestHandler(method: string, handler: (payload: any) => unknown | Promise<unknown>) {
    const protectedMethods = ['getActiveTabs', 'awaitCrossTab']
    if (protectedMethods.includes(method)) {
      throw new Error(`Method "${method}" is protected and cannot be overridden`)
    }
    this.#addRequestHandler(method, handler)
  }

  /**
   * Get the active tabs
   * @param wait The time to wait before returning the active tabs
   * @returns The active tabs
   */
  public async getActiveTabs(wait = 500) {
    const knownTabs = new Map()
    const responses = await this.crossTabRequest<boolean>('getActiveTabs', undefined, '*', wait)
    responses.forEach((response, from) => {
      knownTabs.set(from, response)
    })
    const tabs = Array.from(knownTabs.entries())
    tabs.push([this.#uuid, this.#active.value])
    const sorted = tabs.sort((a, b) => {
      const [aUuid, aActive] = a
      const [bUuid, bActive] = b
      if (aActive === bActive) {
        return aUuid.localeCompare(bUuid, undefined, {
          numeric: false,
          sensitivity: 'base',
          ignorePunctuation: true,
        })
      }
      return aActive === true ? -1 : 1
    })
    const ids = sorted.map((tab) => tab[0]) as Array<string>
    return ids
  }

  /**
   * Check if the tab is the main tab
   * @param wait The time to wait before returning the active tabs
   * @returns Whether the tab is the main tab
   */
  public async isMain(wait = 500) {
    const ids = await this.getActiveTabs(wait)
    return ids.length > 0 ? ids[0] === this.#uuid : false
  }
}
