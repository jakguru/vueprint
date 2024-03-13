import Swal from 'sweetalert2'
import merge from 'lodash.merge'
import * as Tone from 'tone'
import { Notyf } from 'notyf'
// import 'notyf/notyf.min.css'
import { getDebugger } from '../utilities/debug'

export type SwalService = typeof Swal
export type ToastService = typeof Swal
export type NotyfService = Notyf

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
export const swal: SwalService = Swal.mixin(defaults)

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
export const toast: ToastService = Swal.mixin(toastDefaults)

const sdbg = getDebugger('Sounds')
/**
 * A service to manage sounds
 */
export class SoundsService {
  #sounds: Record<string, Tone.Player> = {}

  /**
   * Creates a new SoundsService
   * @param sounds A map of sound names to their urls
   */
  constructor(sounds?: Record<string, string>) {
    if (sounds) {
      sdbg('Initializing sounds', sounds)
      this.add(sounds)
    }
  }

  /**
   * Adds sounds to the service
   * @param sounds A map of sound names to their urls
   */
  public add(sounds: Record<string, string>) {
    Object.keys(sounds).forEach((key) => {
      if (!this.#sounds[key]) {
        sdbg('Adding sound', key)
        const sound = sounds[key]
        this.#sounds[key] = new Tone.Player({
          url: sound,
        }).toDestination()
      }
    })
  }

  /**
   * Gets a sound from the service
   * @param key The key of the sound to retrieve
   * @returns The Tone.Player object for the sound
   */
  public get(key: string) {
    return this.#sounds[key]
  }

  /**
   * Plays a sound
   * @param key The key of the sound to play
   */
  public play(key: string) {
    const sound = this.#sounds[key]
    if (sound) {
      sdbg('Playing sound', key)
      sound.start()
    }
  }

  /**
   * Stops a sound
   * @param key The key of the sound to stop
   */
  public stop(key: string) {
    const sound = this.#sounds[key]
    if (sound) {
      sdbg('Stopping sound', key)
      sound.stop()
    }
  }
}

/**
 * A Notyf instance with the default settings
 */
export const notyf: NotyfService = new Notyf({
  dismissible: true,
})
