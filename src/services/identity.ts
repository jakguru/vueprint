/**
 * @module @jakguru/vueprint/services/identity
 */
import { isAxiosInstance } from './api'
import { BusService } from './bus'
import { LocalStorageService } from './localStorage'
import { MiliCron } from '../libs/milicron'
import type { Ref, ComputedRef, WatchStopHandle } from 'vue'
import { Axios } from 'axios'
import { getDebugger } from '../utilities/debug'
import { ref, computed, watch } from 'vue'
import { DateTime } from 'luxon'

const debug = getDebugger('Identity')

/**
 * Describes the shape of a user identity object
 */
export interface UserIdentity {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Describes the shape of the feedback from the token refresh callback
 */
export interface TokenRefreshFeedback {
  bearer: string
  expiration: string
}

/**
 * Describes the shape of the token refresh callback
 */
export interface TokenRefreshCallback {
  (api: Axios, signal: AbortSignal): Promise<TokenRefreshFeedback> | TokenRefreshFeedback
}

/**
 * The Identity service is used to share the authentication state and user information across the application and across all instances of the application in the same browser, as well as to authenticate any API request made on behalf of the user.
 * @remarks
 *
 * ## Accessing the Identity Service
 *
 * The Identity Service is both injectable and accessible from the global `Vue` instance:
 *
 * ```vue
 *
 * <script lang="ts">
 * import { defineComponent, inject } from 'vue'
 * import type { IdentityService } from '@jakguru/vueprint'
 * export default defineComponent({
 *     setup() {
 *         const identity = inject<IdentityService>('identity')
 *         return {}
 *     }
 *     mounted() {
 *         const identity: IdentityService = this.config.globalProperties.$identity
 *     }
 * })
 * </script>
 * ```
 *
 * ## Using the Identity Service
 *
 * ### Determining Authentication State and Current User
 *
 * The {@link IdentityService.authenticated} accessor provides an easy way to determine if the visitor has been authenticated. It does **not** determine if the current user has been identified (meaning that information about the user has been saved to the local storage), however in most cases that information will be available very soon after the value of `IdentityService.authenticated.value` is true.
 *
 * The {@link IdentityService.identified} accessor provides an easy way to determine if the visitor has been identified. This means that the {@link IdentityService.user} object has been created with at least 1 parameter.
 *
 * ### Setting the authentication state
 *
 * Because VuePrint does not provide any forms, it provides a method for a form to store the authentication information in the appropriate locations in the local storage. This method is {@link IdentityService.login}, and it accepts 3 arguments:
 *
 * * The `bearer` token which will be used to make authenticated API calls
 * * The expiration timestamp of the bearer token
 * * An object which is used as the user identifier
 *
 * ### Deauthenticating a visitor
 *
 * To remove the authentication and identity information of the currently logged in user, simply call the {@link IdentityService.logout} method. It accepts no arguments.
 */
export class IdentityService {
  #bus: BusService
  #api: Axios
  #ls: LocalStorageService
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

  /**
   * Create a new Identity instance
   * @param bus A BusService instance
   * @param ls A LocalStorageService instance
   * @param cron A MiliCron instance
   * @param api An Axios instance
   * @param tokenRefresh A token refresh callback
   * @param tokenRefreshBuffer The amount of time in milliseconds before the token expires before a token is considered refreshable (default: 5 minutes)
   */
  constructor(
    bus: BusService,
    ls: LocalStorageService,
    cron: MiliCron,
    api: Axios,
    tokenRefresh: TokenRefreshCallback,
    tokenRefreshBuffer = 60 * 5
  ) {
    if (!(bus instanceof BusService)) {
      debug({ bus })
      throw new Error('Invalid or missing BusService instance')
    }
    if (!(ls instanceof LocalStorageService)) {
      debug({ ls })
      throw new Error('Invalid or missing LocalStorageService instance')
    }
    if (!(cron instanceof MiliCron)) {
      debug({ cron })
      throw new Error('Invalid or missing MiliCron instance')
    }
    if (!isAxiosInstance(api)) {
      debug({ api })
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

  /**
   * Whether or not the Identity service has booted
   */
  public get booted() {
    return this.#booted
  }

  /**
   * Whether or not the visitor is authenticated
   */
  public get authenticated() {
    return this.#authenticated
  }

  /**
   * Whether or not the visitor is identified
   */
  public get identified() {
    return this.#identified
  }

  /**
   * The user's identity
   */
  public get user() {
    return this.#user
  }

  /**
   * Whether or not the token is refreshable
   */
  public get refreshable() {
    return this.#refreshable
  }

  /**
   * The time until the authentication expires
   */
  public get ttl() {
    return this.#calculatedAuthenticationExpiresIn
  }

  /**
   * Save the bearer token, expiration, and user identity to the LocalStorageService and update the authentication & identification state
   * @param bearer The bearer token
   * @param expiration The expiration time of the token
   * @param identity The user's identity
   * @returns void
   */
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

  /**
   * Remove the bearer token, expiration, and user identity from the LocalStorageService and update the authentication & identification state
   * @returns void
   */
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

  /**
   * Boot the Identity service
   */
  public boot() {
    this.#bus.on('api:unauthorized', this.logout.bind(this), { local: true, crossTab: true })
    this.#bus.on('identity:login', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#bus.on('identity:logout', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#bus.on('tab:active', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
    })
    this.#bus.on('authentication:refreshable', this.#tryToRefreshToken.bind(this), {
      local: true,
      crossTab: true,
      immediate: true,
    })
    this.#cron.$on('*/250 * * * * *', this.#doUpdateFromLocalStorageService.bind(this))
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
    this.#updateFromLocalStorageService(true)
  }

  /**
   * Shutdown the Identity service
   */
  public shutdown() {
    this.#bus.off('api:unauthorized', this.logout.bind(this), { local: true, crossTab: true })
    this.#bus.off('identity:login', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#bus.off('tab:active', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
    })
    this.#bus.off('identity:logout', this.#doUpdateFromLocalStorageService.bind(this), {
      local: true,
      crossTab: true,
    })
    this.#cron.$off('*/250 * * * * *', this.#doUpdateFromLocalStorageService.bind(this))
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

  #doUpdateFromLocalStorageService() {
    this.#updateFromLocalStorageService()
  }

  #updateFromLocalStorageService(first: boolean = false) {
    if (!this.#ls.loaded) {
      this.#ls.promise.then(() => {
        this.#updateFromLocalStorageService(first)
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
            this.#api,
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

  /**
   * Force a refresh of the token
   * @private
   * @remarks This method is not intended to be used by the consumer of the Identity service, but is for development and testing purposes
   */
  public async forceRefreshToken() {
    if (this.#booted.value) {
      await this.#tryToRefreshToken()
    }
  }

  /**
   * Make the token refreshable
   * @private
   * @remarks This method is not intended to be used by the consumer of the Identity service, but is for development and testing purposes
   */
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
