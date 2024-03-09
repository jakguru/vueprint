import type { Bus, BusEvent } from '../src/bus'
import type { MiliCron } from '@jakguru/milicron'
import type { Identity } from '../src/identity'
import type { PushService } from '../src/push'
import type { WatchStopHandle } from 'vue'
import { inject, ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

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
  onTrue: () => void
  onFalse: () => void
}

/**
 * Define the hooks that will be used when an application property changes state
 */
export interface ApplicationHooks {
  onBooted: ApplicationHook
  onReady: ApplicationHook
  onAuthenticated: ApplicationHook
  onPushPermissions: ApplicationHook
}

/**
 * Initialize the VuePrint integration with the application
 * @param hooks The hooks that will be used when an application property changes state
 */
export const useVueprint = (hooks: ApplicationHooks) => {
  const mounted = ref(false)
  const bus = inject<Bus>('bus')
  const cron = inject<MiliCron>('cron')
  const identity = inject<Identity>('identity')
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
  onMounted(() => {
    bootedWatchCanceller = watch(
      () => isBooted.value,
      (booted) => {
        if (booted) {
          hooks.onBooted.onTrue()
        } else {
          hooks.onBooted.onFalse()
        }
      },
      { immediate: true }
    )
    readyWatchCanceller = watch(
      () => isReady.value,
      (ready) => {
        if (ready) {
          hooks.onReady.onTrue()
        } else {
          hooks.onReady.onFalse()
        }
      },
      { immediate: true }
    )
    if (push) {
      pushPermissionWatchCanceller = watch(
        () => push.canPush.value,
        (permission) => {
          if (permission) {
            hooks.onPushPermissions.onTrue()
          } else {
            hooks.onPushPermissions.onFalse()
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
          hooks.onAuthenticated.onTrue()
        } else {
          hooks.onAuthenticated.onFalse()
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
    mounted,
    booted: isBooted,
    ready: isReady,
  }
}
