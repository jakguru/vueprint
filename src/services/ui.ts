import Swal from 'sweetalert2'
import merge from 'lodash.merge'
import * as Tone from 'tone'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import { getDebugger } from '../src/debug'

const defaults = {
  backdrop: true,
  color: '#000000',
  customClass: {
    title: 'text-h6',
    htmlContainer: 'text-body-2',
    popup: 'v-card v-card--density-default v-card--variant-elevated bg-surface elevation-3 pb-3',
    confirmButton:
      'v-btn v-btn--elevated bg-primary v-btn--density-default v-btn--size-default v-btn--variant-elevated',
    denyButton:
      'v-btn v-btn--elevated bg-error v-btn--density-default v-btn--size-default v-btn--variant-elevated',
    cancelButton:
      'v-btn v-btn--elevated bg-cancel v-btn--density-default v-btn--size-default v-btn--variant-elevated',
  },
  buttonsStyling: true,
  reverseButtons: true,
}

/**
 * A SweetAlert2 instance with the default settings
 */
export const swal = Swal.mixin(defaults)

const toastDefaults = merge({}, defaults, {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  backdrop: undefined,
  didOpen: (toast: HTMLElement) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

delete toastDefaults.backdrop
/**
 * A SweetAlert2 instance with the default settings for toasts
 */
export const toast = Swal.mixin(toastDefaults)

/**
 * Initializes the sounds as Tone.Player objects
 * @param sounds A map of sound names to their urls
 * @returns an object with the sounds initialized as Tone.Player objects
 */
export const initializeSounds = (sounds: Record<string, string>) => {
  const debug = getDebugger('Sounds')
  debug('Initializing sounds')
  const ret = Object.assign(
    {},
    ...Object.keys(sounds).map((key) => {
      const sound = sounds[key]
      return {
        [key]:
          typeof document !== 'undefined'
            ? new Tone.Player({
                url: sound,
              }).toDestination()
            : {
                autostart: undefined,
                blockTime: undefined,
                buffer: undefined,
                channelCount: undefined,
                channelCountMode: undefined,
                channelInterpretation: undefined,
                context: undefined,
                debug: undefined,
                disposed: undefined,
                fadeIn: undefined,
                fadeOut: undefined,
                input: undefined,
                loaded: undefined,
                loop: undefined,
                loopEnd: undefined,
                loopStart: undefined,
                mute: undefined,
                name: undefined,
                numberOfInputs: undefined,
                numberOfOutputs: undefined,
                onstop: undefined,
                output: undefined,
                playbackRate: undefined,
                reverse: undefined,
                sampleTime: undefined,
                state: undefined,
                version: undefined,
                volume: undefined,
                chain: () => {},
                connect: () => {},
                disconnect: () => {},
                dispose: () => {},
                fan: () => {},
                get: () => {},
                getDefaults: () => {},
                immediate: () => {},
                load: () => {},
                now: () => {},
                restart: () => {},
                seek: () => {},
                set: () => {},
                setLoopPoints: () => {},
                start: () => {},
                stop: () => {},
                sync: () => {},
                toDestination: () => {},
                toFrequency: () => {},
                toMaster: () => {},
                toSeconds: () => {},
                toString: () => {},
                toTicks: () => {},
                unsync: () => {},
              },
      }
    })
  )
  debug('Sounds initialized')
  return ret
}

/**
 * A Notyf instance with the default settings
 */
export const notyf = new Notyf({
  dismissible: true,
})
