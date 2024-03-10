export * as validation from './validation'
export * as debug from './debug'
export * as colors from './colors'
import type { BusService, BusEvent } from '../services/bus'
import type { MiliCron } from '@jakguru/milicron'
import type { IdentityService } from '../services/identity'
import type { PushService } from '../services/push'
import type { WatchStopHandle } from 'vue'
import { inject, ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'

declare global {
  interface Window {
    _vueprint_loaded?: {
      localstorage?: boolean
      cron?: boolean
    }
  }
}

/**
 * Define the shape of a hook that will be used when an application property changes state
 */
export interface ApplicationHook {
  onTrue?: () => void
  onFalse?: () => void
}

/**
 * Define the hooks that will be used when an application property changes state
 */
export interface ApplicationHooks {
  onBooted?: ApplicationHook
  onReady?: ApplicationHook
  onAuthenticated?: ApplicationHook
  onPushPermissions?: ApplicationHook
}

/**
 * Defines the current state of the implementation of the VuePrint integration with the application
 * @property booted If all pre-mount services have been booted
 * @property mounted If the application is currently mounted
 * @property ready If all post-mount services have been booted
 */
export interface ApplicationVueprintState {
  // If the application is currently mounted
  booted: ComputedRef<boolean>
  // If all pre-mount services have been booted
  mounted: Ref<boolean>
  // If all post-mount services have been booted
  ready: ComputedRef<boolean>
}

/**
 * Initialize the VuePrint integration with the application
 * @param hooks The hooks that will be used when an application property changes state
 * @returns An object containing the state of the application
 */
export const useVueprint = (hooks?: ApplicationHooks): ApplicationVueprintState => {
  const mounted = ref(false)
  const bus = inject<BusService>('bus')
  const cron = inject<MiliCron>('cron')
  const identity = inject<IdentityService>('identity')
  const push = inject<PushService>('push')
  const booted = ref({
    localstorage: false as boolean | null,
    cron: false as boolean | null,
  })
  const windowCallBacks = Object.assign(
    {},
    ...Object.keys(booted.value).map((k) => {
      const windowEvent = [k, 'loaded'].join(':')
      const busEvent = ['loaded', k].join(':') as BusEvent
      return {
        [windowEvent]: () => {
          if (bus) {
            bus.emit(busEvent, { local: true })
          }
        },
      }
    }),
    ...Object.keys(booted.value).map((k) => {
      const windowEvent = [k, 'failed'].join(':')
      const busEvent = ['failed', k].join(':') as BusEvent
      return {
        [windowEvent]: () => {
          if (bus) {
            bus.emit(busEvent, { local: true })
          }
        },
      }
    })
  )
  const busCallBacks = Object.assign(
    {},
    ...Object.keys(booted.value).map((k) => {
      const busEvent = ['loaded', k].join(':') as BusEvent
      return {
        [busEvent]: () => {
          booted.value[k as keyof typeof booted.value] = true
        },
      }
    }),
    ...Object.keys(booted.value).map((k) => {
      const busEvent = ['failed', k].join(':') as BusEvent
      return {
        [busEvent]: () => {
          booted.value[k as keyof typeof booted.value] = null
        },
      }
    })
  )
  const isBooted = computed(() =>
    Object.values(booted.value).every((v) => v === true || v === null)
  )
  const dependanciesBooted = computed(() => ({
    identity: identity?.booted.value || false,
    push: push?.booted.value || false,
  }))
  const isDependanciesBooted = computed(() =>
    Object.values(dependanciesBooted.value).every((v) => v === true)
  )
  const isReady = computed(() => isBooted.value && isDependanciesBooted.value)
  let bootedWatchCanceller: WatchStopHandle | undefined
  let readyWatchCanceller: WatchStopHandle | undefined
  let identityBootedWatchCanceller: WatchStopHandle | undefined
  let pushBootedWatchCanceller: WatchStopHandle | undefined
  let authenticatedWatchCanceller: WatchStopHandle | undefined
  let pushPermissionWatchCanceller: WatchStopHandle | undefined

  const doHooksOnBootedOnTrue = () => {
    if (hooks && hooks.onBooted && hooks.onBooted.onTrue) {
      hooks.onBooted.onTrue()
    }
  }
  const doHooksOnReadyOnTrue = () => {
    if (hooks && hooks.onReady && hooks.onReady.onTrue) {
      hooks.onReady.onTrue()
    }
  }
  const doHooksOnPushPermissionsOnTrue = () => {
    if (hooks && hooks.onPushPermissions && hooks.onPushPermissions.onTrue) {
      hooks.onPushPermissions.onTrue()
    }
  }
  const doHooksOnAuthenticatedOnTrue = () => {
    if (hooks && hooks.onAuthenticated && hooks.onAuthenticated.onTrue) {
      hooks.onAuthenticated.onTrue()
    }
  }

  const doHooksOnBootedOnFalse = () => {
    if (hooks && hooks.onBooted && hooks.onBooted.onFalse) {
      hooks.onBooted.onFalse()
    }
  }
  const doHooksOnReadyOnFalse = () => {
    if (hooks && hooks.onReady && hooks.onReady.onFalse) {
      hooks.onReady.onFalse()
    }
  }
  const doHooksOnPushPermissionsOnFalse = () => {
    if (hooks && hooks.onPushPermissions && hooks.onPushPermissions.onFalse) {
      hooks.onPushPermissions.onFalse()
    }
  }
  const doHooksOnAuthenticatedOnFalse = () => {
    if (hooks && hooks.onAuthenticated && hooks.onAuthenticated.onFalse) {
      hooks.onAuthenticated.onFalse()
    }
  }

  onMounted(() => {
    bootedWatchCanceller = watch(
      () => isBooted.value,
      (booted) => {
        if (booted) {
          doHooksOnBootedOnTrue()
        } else {
          doHooksOnBootedOnFalse()
        }
      },
      { immediate: true }
    )
    readyWatchCanceller = watch(
      () => isReady.value,
      (ready) => {
        if (ready) {
          doHooksOnReadyOnTrue()
        } else {
          doHooksOnReadyOnFalse()
        }
      },
      { immediate: true }
    )
    if (push) {
      pushPermissionWatchCanceller = watch(
        () => push.canPush.value,
        (permission) => {
          if (permission) {
            doHooksOnPushPermissionsOnTrue()
          } else {
            doHooksOnPushPermissionsOnFalse()
          }
        }
      )
      pushBootedWatchCanceller = watch(
        () => push.booted.value,
        (booted) => {
          dependanciesBooted.value.push = booted
        },
        { immediate: true }
      )
    }
    if (identity) {
      identityBootedWatchCanceller = watch(
        () => identity.booted.value,
        (is) => {
          dependanciesBooted.value.identity = is
        },
        { immediate: true }
      )
      authenticatedWatchCanceller = watch(identity.authenticated, (authenticated) => {
        if (authenticated) {
          doHooksOnAuthenticatedOnTrue()
        } else {
          doHooksOnAuthenticatedOnFalse()
        }
      })
    }
    if (cron) {
      cron.$once('* * * * * * *', () => {
        booted.value.cron = true
      })
      cron.start()
    }
    if (window) {
      if (!window._vueprint_loaded) {
        window._vueprint_loaded = {}
      }
      for (const key in windowCallBacks) {
        window.addEventListener(key, windowCallBacks[key])
      }
      for (const key in window._vueprint_loaded) {
        if (true === window._vueprint_loaded[key as keyof typeof window._vueprint_loaded]) {
          windowCallBacks[`${key}:loaded`]()
        } else if (null === window._vueprint_loaded[key as keyof typeof window._vueprint_loaded]) {
          windowCallBacks[`${key}:failed`]()
        }
      }
    }
    if (bus) {
      for (const key in busCallBacks) {
        bus.on(key as BusEvent, busCallBacks[key], { local: true, immediate: true })
      }
    }
    nextTick(() => {
      if (identity) {
        identity.boot()
      }
      if (push) {
        push.boot()
      }
      mounted.value = true
    })
  })
  onBeforeUnmount(() => {
    if (cron) {
      cron.stop()
    }
    if (window) {
      for (const key in windowCallBacks) {
        window.removeEventListener(key, windowCallBacks[key])
      }
    }
    if (bus) {
      for (const key in busCallBacks) {
        bus.off(key as BusEvent, busCallBacks[key], { local: true })
      }
    }
    if (identity) {
      identity.shutdown()
    }
    if (push) {
      push.shutdown()
    }
    if (bootedWatchCanceller) {
      bootedWatchCanceller()
    }
    if (readyWatchCanceller) {
      readyWatchCanceller()
    }
    if (identityBootedWatchCanceller) {
      identityBootedWatchCanceller()
    }
    if (authenticatedWatchCanceller) {
      authenticatedWatchCanceller()
    }
    if (pushBootedWatchCanceller) {
      pushBootedWatchCanceller()
    }
    if (pushPermissionWatchCanceller) {
      pushPermissionWatchCanceller()
    }
    mounted.value = false
  })
  return {
    // If the application is currently mounted
    mounted,
    // If all pre-mount services have been booted
    booted: isBooted,
    // If all post-mount services have been booted
    ready: isReady,
  }
}
