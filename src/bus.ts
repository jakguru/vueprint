import type { NotificationPayload } from 'firebase/messaging'
import type { Ref } from 'vue'
import type { UserIdentity } from './identity'
import { TinyEmitter } from 'tiny-emitter'
import { BroadcastChannel } from 'broadcast-channel'
import { computed, ref } from 'vue'
import { getDebugger } from './debug'
const debug = getDebugger('Bus')

/**
 * Describes the events and the signatures of their callbacks
 * Should be extended by the application to include all the events it needs
 * @group Bus
 */
export type BusEventCallbackSignatures = {
  /**
   * Emitted when the API returns a 401 Unauthorized status
   * @param from The ID of the tab that triggered the event
   */
  'api:unauthorized': (from?: string) => void
  /**
   * A tab has been updated
   * @param uuid The ID of the tab which has been updated
   * @param active If the new tab is "active" or not
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'tab:uuid': (uuid: string, active: boolean, from?: string) => void
  /**
   * A tab has become active
   * @param from The ID of the tab that triggered the event
   */
  'tab:active': (from?: string) => void
  /**
   * A tab has become inactive
   * @param from The ID of the tab that triggered the event
   */
  'tab:inactive': (from?: string) => void
  /**
   * The push service has been updated
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:updated': (from?: string) => void
  /**
   * The push service has been granted permission
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:permission:denied': (from?: string) => void
  /**
   * The push service has been denied permission
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:permission:granted': (from?: string) => void
  /**
   * A push notification has been received
   * @param payload The payload of the notification
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'push:notification': (payload: NotificationPayload, from?: string) => void
  /**
   * The Firebase token has been updated
   * @param token The new token
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'firebase:token:updated': (token: string | undefined, from?: string) => void
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
    from?: string
  ) => void
  /**
   * The user has been logged out
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'identity:logout': (from?: string) => void
  /**
   * The user's authentication token is eligible for refresh
   * @param from The ID of the tab that triggered the event
   * @returns void
   */
  'authentication:refreshable': (from?: string) => void
}

/**
 * The events that can be emitted and listened to
 * @group Bus
 */
export type BusEvent = keyof BusEventCallbackSignatures

/**
 * The callback signatures for the events
 * @group Bus
 */
export type BusEventCallback<T extends keyof BusEventCallbackSignatures> =
  BusEventCallbackSignatures[T]

/**
 * The events that have already been triggered
 * @group Bus
 */
export type BusEventAlreadyTriggered = {
  [key in keyof BusEventCallbackSignatures]: Parameters<BusEventCallback<key>>
}

/**
 * Options for listening to events
 * @group Bus
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
 * @group Bus
 * @inheritdoc BusEventListenOptions
 */
export type BusEventEmitOptions = Omit<BusEventListenOptions, 'immediate'>

/**
 * Generate a likely unique short ID for identifying tabs
 * @group Bus
 * @returns A short ID
 */
export function shortid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * A bus for transmitting and subscribing to events acrosss components and tabs
 * @group Bus
 */
export class Bus {
  #uuid: string
  #channel?: BroadcastChannel
  #localBus: TinyEmitter
  #crossTabBus: TinyEmitter
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
    this.#localBus = new TinyEmitter()
    this.#crossTabBus = new TinyEmitter()
    this.#active = ref(false)
    this.#lastUpdatedAt = ref(undefined)
    this.#alreadyTriggeredLocalEvents = ref({})
    this.#alreadyTriggeredCrossTabEvents = ref({})
    if (typeof window !== 'undefined') {
      this.#channel = new BroadcastChannel(namespace || window.location.origin)
      this.#channel.onmessage = this.#onChannelMessage.bind(this)
      window.addEventListener('focus', this.#onWindowFocusChange.bind(this, true))
      window.addEventListener('blur', this.#onWindowFocusChange.bind(this, false))
      window.addEventListener('visibilitychange', this.#onWindowVisibilitychange.bind(this))
      this.#onWindowVisibilitychange()
    }
    debug(`Initialized Bus for tab ${this.#uuid}`)
    debug(this.#localBus)
  }

  #onChannelMessage(raw: string) {
    let event: BusEvent
    let args: Parameters<BusEventCallback<BusEvent>> = []
    let from: string
    try {
      const msg = JSON.parse(raw)
      event = msg.event as BusEvent
      args = msg.args as Parameters<BusEventCallback<BusEvent>>
      from = msg.from as string
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
   * Get the active tabs
   * @param wait The time to wait before returning the active tabs
   * @returns The active tabs
   */
  public async getActiveTabs(wait = 500) {
    return (await new Promise((resolve) => {
      const knownTabs = new Map()
      const onTabUuid = (uuid: string, active: boolean) => {
        knownTabs.set(uuid, active)
      }
      this.on('tab:uuid', onTabUuid, { local: false, crossTab: true })
      setTimeout(() => {
        this.off('tab:uuid', onTabUuid, { local: false, crossTab: true })
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
        return resolve(ids)
      }, wait)
    })) as Array<string>
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
