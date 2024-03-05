import { BroadcastChannel } from 'broadcast-channel'
import type { NotificationPayload } from 'firebase/messaging'
import { TinyEmitter } from 'tiny-emitter'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { getDebugger } from './debug'
const debug = getDebugger('Bus')

export type BusEventCallbackSignatures = {
  'tab:uuid': (uuid: string, active: boolean, from?: string) => void
  'tab:active': (from?: string) => void
  'tab:inactive': (from?: string) => void
  'push:updated': (from?: string) => void
  'push:permission:denied': (from?: string) => void
  'push:permission:granted': (from?: string) => void
  'push:notification': (payload: NotificationPayload, from?: string) => void
  'firebase:token:updated': (token: string | undefined, from?: string) => void
}

export type BusEvent = keyof BusEventCallbackSignatures

export type BusEventCallback<T extends keyof BusEventCallbackSignatures> =
  BusEventCallbackSignatures[T]

export type BusEventAlreadyTriggered = {
  [key in keyof BusEventCallbackSignatures]: Parameters<BusEventCallback<key>>
}

/**
 * @param local - Emit and listen to events in the same tab
 * @param crossTab - Emit and listen to events in other tabs
 * @param immediate - If the event has already been triggered, trigger it immediately
 */
export interface BusEventListenOptions {
  local?: boolean
  crossTab?: boolean
  immediate?: boolean
}

export type BusEventEmitOptions = Omit<BusEventListenOptions, 'immediate'>

export function shortid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export class Bus {
  #uuid: string
  #channel?: BroadcastChannel
  #localBus: TinyEmitter
  #crossTabBus: TinyEmitter
  #active: Ref<boolean>
  #lastUpdatedAt: Ref<number | undefined>
  #alreadyTriggeredLocalEvents: Ref<Partial<BusEventAlreadyTriggered>>
  #alreadyTriggeredCrossTabEvents: Ref<Partial<BusEventAlreadyTriggered>>

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

  public get uuid() {
    return this.#uuid
  }

  public get active() {
    return computed(() => this.#active.value)
  }

  public get inactiveTooLong() {
    return computed(() => {
      if (this.#active.value === true || this.#lastUpdatedAt.value === undefined) {
        return false
      }
      return Date.now() - this.#lastUpdatedAt.value > 60000
    })
  }

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

  public async isMain(wait = 500) {
    const ids = await this.getActiveTabs(wait)
    return ids.length > 0 ? ids[0] === this.#uuid : false
  }
}
