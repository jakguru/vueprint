import { Bus } from './bus'
import { LocalStorage } from './localStorage'
import { MiliCron } from '@jakguru/milicron'
import type { Ref, ComputedRef, WatchStopHandle } from 'vue'
import { Axios } from 'axios'
import { getDebugger } from './debug'
import { ref, computed, watch } from 'vue'
import { DateTime } from 'luxon'

const debug = getDebugger('Identity')

export interface UserIdentity {
  [key: string]: string
}

export interface TokenRefreshFeedback {
  bearer: string
  expiration: string
}

export interface TokenRefreshCallback {
  (signal: AbortSignal): Promise<TokenRefreshFeedback> | TokenRefreshFeedback
}

export class Identity {
  #bus: Bus
  #api: Axios
  #ls: LocalStorage
  #cron: MiliCron
  #booted: Ref<boolean>
  #storedBearer: Ref<string | undefined>
  #storedExpiration: Ref<string | undefined>
  #storedUserIdentity: Ref<UserIdentity | undefined>
  #calculatedAuthenticationExpiresIn: Ref<number | undefined> = ref(undefined)
  #watcher: WatchStopHandle | undefined
  #refreshable: ComputedRef<boolean>
  #refreshableWatcher: WatchStopHandle | undefined
  #authenticated: ComputedRef<boolean>
  #identified: ComputedRef<boolean>
  #user: ComputedRef<UserIdentity | undefined>
  #tokenRefreshAbortController: Ref<AbortController | undefined>
  #tokenRefresh: TokenRefreshCallback
  #tokenRefreshBuffer: number

  constructor(
    bus: Bus,
    ls: LocalStorage,
    cron: MiliCron,
    api: Axios,
    tokenRefresh: TokenRefreshCallback,
    tokenRefreshBuffer = 60 * 5
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
    if (!(api instanceof Axios)) {
      throw new Error('Invalid or missing Axios instance')
    }
    this.#booted = ref(false)
    this.#bus = bus
    this.#api = api
    this.#ls = ls
    this.#tokenRefresh = tokenRefresh
    this.#tokenRefreshBuffer = tokenRefreshBuffer
    this.#cron = cron
    this.#storedBearer = ref(undefined)
    this.#storedExpiration = ref(undefined)
    this.#storedUserIdentity = ref(undefined)
    this.#calculatedAuthenticationExpiresIn = ref(undefined)
    this.#refreshable = computed(() => {
      return (
        this.#calculatedAuthenticationExpiresIn.value !== undefined &&
        this.#calculatedAuthenticationExpiresIn.value > 0 &&
        this.#calculatedAuthenticationExpiresIn.value <= this.#tokenRefreshBuffer
      )
    })
    this.#authenticated = computed(() => {
      return (
        this.#booted.value === true &&
        this.#storedBearer.value !== undefined &&
        this.#calculatedAuthenticationExpiresIn.value !== undefined &&
        this.#calculatedAuthenticationExpiresIn.value > 0
      )
    })
    this.#identified = computed(() => {
      return (
        this.#authenticated.value &&
        this.#storedUserIdentity.value !== undefined &&
        this.#storedUserIdentity.value !== null &&
        Object.keys(this.#storedUserIdentity.value).length > 0
      )
    })
    this.#user = computed(() => {
      if (!this.#identified.value) {
        return undefined
      }
      return {
        ...this.#storedUserIdentity.value!,
      }
    })
    this.#tokenRefreshAbortController = ref(undefined)
  }

  public get booted() {
    return this.#booted
  }

  public get authenticated() {
    return this.#authenticated
  }

  public get identified() {
    return this.#identified
  }

  public get user() {
    return this.#user
  }

  public get refreshable() {
    return this.#refreshable
  }

  public get ttl() {
    return this.#calculatedAuthenticationExpiresIn
  }

  public login(bearer: string, expiration: string, identity: UserIdentity) {
    if (!this.#booted) {
      debug('Login not processed because not booted')
      return
    }
    this.#ls.set('bearer', bearer)
    this.#storedBearer.value = bearer
    this.#ls.set('expiration', expiration)
    this.#storedExpiration.value = expiration
    this.#ls.set('user.identity', identity)
    this.#storedUserIdentity.value = identity
    this.#doCalculations()
    this.#bus.emit(
      'identity:login',
      {
        local: true,
        crossTab: true,
      },
      bearer,
      expiration,
      identity
    )
  }

  public logout() {
    this.#ls.remove('bearer')
    this.#storedBearer.value = undefined
    this.#ls.remove('expiration')
    this.#storedExpiration.value = undefined
    this.#ls.remove('user.identity')
    this.#storedUserIdentity.value = undefined
    this.#bus.emit('identity:logout', {
      local: true,
      crossTab: true,
    })
  }

  public boot() {
    this.#bus.on('api:unauthorized', this.logout.bind(this), { local: true, crossTab: true })
    this.#bus.on('identity:login', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#bus.on('identity:logout', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#bus.on('tab:active', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
    })
    this.#bus.on('authentication:refreshable', this.#tryToRefreshToken.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#cron.$on('*/250 * * * * *', this.#doUpdateFromLocalStorage.bind(this))
    this.#cron.$on('* * * * *', this.#doCalculations.bind(this))
    /** Setup watcher on authentication expiration time */
    this.#watcher = watch(
      () => this.#calculatedAuthenticationExpiresIn.value,
      (updated, previous) => {
        if (updated === previous) {
          return
        }
        if (
          updated === undefined &&
          previous !== undefined &&
          this.#storedBearer.value !== undefined
        ) {
          debug('Authentication Expired. Logging Out.')
          this.logout()
        } else if (updated !== undefined && updated <= 0) {
          debug('Authentication Expired. Logging Out.')
          this.logout()
        }
      },
      {
        immediate: true,
      }
    )
    /** Setup watcher for if the "refreshable" state changes */
    this.#refreshableWatcher = watch(
      () => this.#refreshable.value,
      (refreshable) => {
        if (refreshable) {
          debug('Token is refreshable')
          this.#bus.emit('authentication:refreshable', {
            local: true,
            crossTab: true,
          })
        }
      }
    )
    /** Update from the local storage in order to say that we've booted */
    this.#updateFromLocalStorage(true)
  }

  public shutdown() {
    this.#bus.off('api:unauthorized', this.logout.bind(this), { local: true, crossTab: true })
    this.#bus.off('identity:login', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#bus.off('tab:active', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
    })
    this.#bus.off('identity:logout', this.#doUpdateFromLocalStorage.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#cron.$off('*/250 * * * * *', this.#doUpdateFromLocalStorage.bind(this))
    this.#cron.$off('* * * * *', this.#doCalculations.bind(this))
    if (this.#watcher) {
      this.#watcher()
    }
    if (this.#refreshableWatcher) {
      this.#refreshableWatcher()
    }
    this.#booted.value = false
    debug('Shutdown')
  }

  #doUpdateFromLocalStorage() {
    this.#updateFromLocalStorage()
  }

  #updateFromLocalStorage(first: boolean = false) {
    if (!this.#ls.loaded) {
      this.#ls.promise.then(() => {
        this.#updateFromLocalStorage(first)
      })
      return
    }
    this.#storedBearer.value = this.#ls.get('bearer')
    this.#storedExpiration.value = this.#ls.get('expiration')
    this.#storedUserIdentity.value = this.#ls.get('user.identity')
    if (first) {
      this.#doCalculations()
      this.#booted.value = true
      debug('Booted')
    }
  }

  #doCalculations() {
    /** Calculate how long until the authentication we currently have expires */
    if (!this.#storedExpiration.value) {
      this.#calculatedAuthenticationExpiresIn.value = undefined
      return
    } else {
      const expiration = DateTime.fromISO(this.#storedExpiration.value)
      if (!expiration.isValid) {
        this.#calculatedAuthenticationExpiresIn.value = undefined
        return
      }
      const now = DateTime.now()
      const diff = expiration.diff(now, 'seconds')
      this.#calculatedAuthenticationExpiresIn.value = diff.seconds
    }
  }

  async #tryToRefreshToken() {
    if (this.#bus && this.#api) {
      const main = await this.#bus.isMain(500)
      if (main) {
        if (this.#tokenRefreshAbortController.value) {
          this.#tokenRefreshAbortController.value.abort()
        }
        this.#tokenRefreshAbortController.value = new AbortController()
        try {
          const { bearer, expiration } = await this.#tokenRefresh(
            this.#tokenRefreshAbortController.value.signal
          )
          this.#ls.set('bearer', bearer)
          this.#storedBearer.value = bearer
          this.#ls.set('expiration', expiration)
          this.#storedExpiration.value = expiration
          this.#doCalculations()
        } catch (e) {
          debug('Failed to refresh token')
        }
      } else {
        debug('Not main tab. Allowing main tab to refresh token.')
      }
    }
  }

  public async forceRefreshToken() {
    if (this.#booted.value) {
      await this.#tryToRefreshToken()
    }
  }

  public $makeRefreshable() {
    if (
      this.#booted.value &&
      'string' === typeof this.#storedBearer.value &&
      'string' === typeof this.#storedExpiration.value
    ) {
      const newExpiration = DateTime.now().plus({ seconds: this.#tokenRefreshBuffer }).toISO()
      this.#ls.set('expiration', newExpiration)
      this.#storedExpiration.value = newExpiration
      this.#doCalculations()
    }
  }
}
