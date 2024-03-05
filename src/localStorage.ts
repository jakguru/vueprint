import dot from 'dot-object'
import merge from 'lodash.merge'
import type SecureLS from 'secure-ls'
import { TinyEmitter } from 'tiny-emitter'
import type { Ref } from 'vue/'
import { ref, watch } from 'vue/'
import { getDebugger } from './debug'
const debug = getDebugger('LocalStorage')

declare global {
  interface Window {
    _vueprint_loaded?: {
      localstorage?: boolean
    }
  }
}

export class LocalStorage {
  #namespace: string
  #bus: TinyEmitter
  #instance?: SecureLS
  #ref: Ref<Record<string, any>>
  #promise: Promise<void>
  #loaded = false
  #unwatch?: () => void
  #inServerEnvironment: boolean
  #channel?: BroadcastChannel

  constructor(namespace: string) {
    this.#namespace = namespace
    this.#inServerEnvironment = !(typeof window !== 'undefined')
    this.#bus = new TinyEmitter()
    this.#ref = ref({})
    if (typeof window !== 'undefined') {
      this.#channel = new BroadcastChannel(`ls:${namespace}`)
      this.#channel.onmessage = () => {
        debug('Updating due to change in another tab.')
        this.refresh()
      }
      this.on('change', () => {
        debug('Notifying other tabs about change.')
        this.#channel?.postMessage('change')
      })
      this.#promise = new Promise((resolve) => {
        import('secure-ls').then(({ default: SecureLS }) => {
          this.#instance = new SecureLS({
            encodingType: 'aes',
            isCompression: true,
            encryptionSecret: namespace,
          })
          this.#doRefresh()
          this.#bus.on('tab:active', this.#doRefresh.bind(this), { local: true })
          this.#unwatch = watch(
            () => this.#ref.value,
            () => {
              this.#bus.emit('change')
              this.#commit()
            },
            {
              deep: true,
            }
          )
          debug(`Loaded Encrypted Local Storage Values for ${namespace}.`)
          this.#loaded = true
          this.#bus.emit('loaded')
          resolve()
        })
      })
    } else {
      this.#promise = Promise.resolve()
    }
    this.#promise.then(() => {
      debug(`Loaded Encrypted Local Storage for ${namespace}.`)
    })
    this.on('loaded', () => {
      if (window) {
        if (!window._vueprint_loaded) {
          window._vueprint_loaded = {}
        }
        window._vueprint_loaded.localstorage = true
        const event = new CustomEvent('localstorage:loaded', { detail: {} })
        window.dispatchEvent(event)
      }
    })
    this.#unwatch = () => {}
  }

  public get loaded() {
    return this.#loaded
  }

  public get promise() {
    return this.#promise
  }

  public get value() {
    return this.#ref.value
  }

  #doRefresh() {
    if (this.#instance) {
      let current: any
      try {
        current = JSON.parse(this.#instance.get(this.#namespace) || '{}')
      } catch (error) {
        debug(`Error parsing localStorage ${this.#namespace}.`, error)
        current = {}
      }
      const merged = merge({}, this.#ref.value, current)
      this.#ref.value = merged
    } else if (!this.#inServerEnvironment) {
      debug(`Trying to refresh localStorage ${this.#namespace} before it is loaded.`)
    }
  }

  #commit() {
    if (this.#instance) {
      this.#instance.set(this.#namespace, JSON.stringify({ ...this.#ref.value }))
    }
  }

  public refresh() {
    if (this.#unwatch) {
      this.#unwatch()
    }
    this.#doRefresh()
    this.#unwatch = watch(
      () => this.#ref.value,
      () => {
        this.#bus.emit('change')
        this.#commit()
      },
      {
        deep: true,
      }
    )
  }

  public getEncryptionSecret() {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(
        `Trying to fetch encryption secret from localStorage ${this.#namespace} before it is loaded.`
      )
    }
    return this.#instance?.getEncryptionSecret() || ''
  }

  public get(key: string): any {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to fetch ${key} from localStorage ${this.#namespace} before it is loaded.`)
    }
    return dot.pick(key, this.#ref.value)
  }

  public getDataFromLocalStorage(key: string): string | null {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to fetch ${key} from localStorage ${this.#namespace} before it is loaded.`)
    }
    return this.#instance?.getDataFromLocalStorage(key) || null
  }

  public getAllKeys(): string[] {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to fetch keys from localStorage ${this.#namespace} before it is loaded.`)
    }
    return Object.keys(this.#ref.value)
  }

  public set(key: string, data: any): void {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to set ${key} in localStorage ${this.#namespace} before it is loaded.`)
    }
    if (this.#unwatch) {
      this.#unwatch()
    }
    dot.set(key, data, this.#ref.value)
    this.#commit()
    this.#unwatch = watch(
      () => this.#ref.value,
      () => {
        this.#bus.emit('change')
        this.#commit()
      },
      {
        deep: true,
      }
    )
    this.#bus.emit('change')
  }

  public merge(data: any): void {
    const src = { ...this.#ref.value }
    const dst = { ...data }
    const merged = merge({}, src, dst)
    this.#ref.value = merged
    this.#commit()
  }

  public setDataToLocalStorage(key: string, data: string): void {
    if (this.#instance) {
      this.#bus.emit('setDataToLocalStorage', key, data)
    }
    return this.#instance?.setDataToLocalStorage(key, data)
  }

  public remove(key: string): void {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to remove ${key} from localStorage ${this.#namespace} before it is loaded.`)
    }
    dot.delete(key, this.#ref.value)
    this.#commit()
  }

  public removeAll(): void {
    if (!this.#instance && !this.#inServerEnvironment) {
      debug(`Trying to remove all keys from localStorage ${this.#namespace} before it is loaded.`)
    }
    this.#ref.value = {}
    this.#commit()
  }

  public clear(): void {
    this.removeAll()
    if (this.#instance) {
      this.#bus.emit('clear')
    } else {
      debug(`Trying to clear localStorage ${this.#namespace} before it is loaded.`)
    }
    return this.#instance?.clear()
  }

  public resetAllKeys(): [] {
    if (this.#instance) {
      this.#bus.emit('resetAllKeys')
    }
    return this.#instance?.resetAllKeys() || []
  }

  /**
   * Add a listener for an event on the local bus.
   * @param event The event name.
   * @param callback The callback function.
   */
  public on(event: string, callback: (...args: any[]) => void) {
    this.#bus.on(event, callback)
  }

  /**
   * Remove a listener for an event on the local bus.
   * @param event The event name.
   * @param callback The callback function.
   */
  public off(event: string, callback: (...args: any[]) => void) {
    this.#bus.off(event, callback)
  }

  /**
   * Add a listener for an event on the local bus one time
   * @param event The event name.
   * @param callback The callback function.
   */
  public once(event: string, callback: (...args: any[]) => void) {
    this.#bus.once(event, callback)
  }
}
