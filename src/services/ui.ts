/**
 * @module @jakguru/vueprint/services/ui
 * @remarks
 *
 * The UI Service provides libraries which can be used in conjunction with Vuetify to provide a user feedback. It provides specific services for:
 *
 * * [SweetAlert2 Alerts](https://sweetalert2.github.io/)
 * * [SweetAlert2 Toasts](https://sweetalert2.github.io/)
 * * [Notyf Toasts](https://github.com/caroso1222/notyf)
 * * [Tone Audio Players](https://tonejs.github.io/)
 *
 * ## Accessing the UI Service
 *
 * The UI Service is both injectable and accessible from the global `Vue` instance:
 *
 * ```vue
 *
 * <script lang="ts">
 * import { defineComponent, inject } from 'vue'
 * import type { SwalService, ToastService, NotyfService, SoundsService } from '@jakguru/vueprint'
 * export default defineComponent({
 *     setup() {
 *         const swal = inject<SwalService>('swal')
 *         const toast = inject<ToastService>('toast')
 *         const notyf = inject<NotyfService>('notyf')
 *         const sounds = inject<SoundsService>('sounds')
 *         return {}
 *     }
 *     mounted() {
 *         const swal: SwalService = this.config.globalProperties.$swal
 *         const toast: ToastService = this.config.globalProperties.$toast
 *         const notyf: NotyfService = this.config.globalProperties.$notyf
 *         const sounds: SoundsService = this.config.globalProperties.$sounds
 *     }
 * })
 * </script>
 * ```
 *
 * ## Using the UI Service
 * ### SweetAlert2 Alerts
 *
 * The built in SweetAlert2 Alerts are styled to match the theme of the application using Vuetify's styling classes.
 *
 * For in-depth specifications, please see the [SweetAlert2 Documentation](https://sweetalert2.github.io/)
 *
 * ### SweetAlert2 Toasts
 *
 * The built in SweetAlert2 Toasts are configured to show a toast notification which is styled to match the theme of the application using Vuetify's styling classes.
 *
 * For in-depth specifications, please see the [SweetAlert2 Documentation](https://sweetalert2.github.io/)
 *
 * ### Notyf Toasts
 *
 * The built in Notyf integration simply provides the integration as-is without any specific changes or modifications. The main advantage of using Notyf over SweetAlert2 Toasts is that you can have multiple toasts show at the same time.
 *
 * For in-depth specifications, please see the [Notyf Documentation](https://github.com/caroso1222/notyf)
 *
 * ### SoundsService
 *
 * The SoundsService manages the sounds which are available by exposing the {@link SoundsService.add} method, and allows sounds to be played using the {@link SoundsService.play} method.
 *
 * ::: info
 * For more specifics, see the {@link SoundsService} documentation.
 * :::
 *
 */

import Swal from 'sweetalert2/dist/sweetalert2.js'
import * as SwalTypes from 'sweetalert2'
import merge from 'lodash.merge'
import * as Tone from 'tone'
import { Notyf } from 'notyf'
// import 'notyf/notyf.min.css'
import { getDebugger } from '../utilities/debug'

export interface SwalService {
  fire<T = any>(
    options: SwalTypes.SweetAlertOptions
  ): Promise<SwalTypes.SweetAlertResult<Awaited<T>>>
  fire<T = any>(
    title?: string,
    html?: string,
    icon?: SwalTypes.SweetAlertIcon
  ): Promise<SwalTypes.SweetAlertResult<Awaited<T>>>
  mixin(options: SwalTypes.SweetAlertOptions): SwalService
  isVisible(): boolean
  update(options: Pick<SwalTypes.SweetAlertOptions, SwalTypes.SweetAlertUpdatableParameters>): void
  close(result?: Partial<SwalTypes.SweetAlertResult>): void
  getContainer(): HTMLElement | null
  getPopup(): HTMLElement | null
  getTitle(): HTMLElement | null
  getProgressSteps(): HTMLElement | null
  getHtmlContainer(): HTMLElement | null
  getImage(): HTMLElement | null
  getCloseButton(): HTMLButtonElement | null
  getIcon(): HTMLElement | null
  getIconContent(): HTMLElement | null
  getConfirmButton(): HTMLButtonElement | null
  getDenyButton(): HTMLButtonElement | null
  getCancelButton(): HTMLButtonElement | null
  getActions(): HTMLElement | null
  getFooter(): HTMLElement | null
  getTimerProgressBar(): HTMLElement | null
  getFocusableElements(): readonly HTMLElement[]
  enableButtons(): void
  disableButtons(): void
  showLoading(buttonToReplace?: HTMLButtonElement | null): void
  hideLoading(): void
  isLoading(): boolean
  clickConfirm(): void
  clickDeny(): void
  clickCancel(): void
  showValidationMessage(validationMessage: string): void
  resetValidationMessage(): void
  getInput(): HTMLInputElement | null
  disableInput(): void
  enableInput(): void
  getValidationMessage(): HTMLElement | null
  getTimerLeft(): number | undefined
  stopTimer(): number | undefined
  resumeTimer(): number | undefined
  toggleTimer(): number | undefined
  isTimerRunning(): boolean | undefined
  increaseTimer(ms: number): number | undefined
  bindClickHandler(attribute?: string): void
  isValidParameter(paramName: string): paramName is keyof SwalTypes.SweetAlertOptions
  isUpdatableParameter(paramName: string): paramName is SwalTypes.SweetAlertUpdatableParameters
  argsToParams(
    params: SwalTypes.SweetAlertArrayOptions | readonly [SwalTypes.SweetAlertOptions]
  ): SwalTypes.SweetAlertOptions
  version: string
}
export interface ToastService {
  fire<T = any>(
    options: SwalTypes.SweetAlertOptions
  ): Promise<SwalTypes.SweetAlertResult<Awaited<T>>>
  fire<T = any>(
    title?: string,
    html?: string,
    icon?: SwalTypes.SweetAlertIcon
  ): Promise<SwalTypes.SweetAlertResult<Awaited<T>>>
  mixin(options: SwalTypes.SweetAlertOptions): ToastService
  isVisible(): boolean
  update(options: Pick<SwalTypes.SweetAlertOptions, SwalTypes.SweetAlertUpdatableParameters>): void
  close(result?: Partial<SwalTypes.SweetAlertResult>): void
  getContainer(): HTMLElement | null
  getPopup(): HTMLElement | null
  getTitle(): HTMLElement | null
  getProgressSteps(): HTMLElement | null
  getHtmlContainer(): HTMLElement | null
  getImage(): HTMLElement | null
  getCloseButton(): HTMLButtonElement | null
  getIcon(): HTMLElement | null
  getIconContent(): HTMLElement | null
  getConfirmButton(): HTMLButtonElement | null
  getDenyButton(): HTMLButtonElement | null
  getCancelButton(): HTMLButtonElement | null
  getActions(): HTMLElement | null
  getFooter(): HTMLElement | null
  getTimerProgressBar(): HTMLElement | null
  getFocusableElements(): readonly HTMLElement[]
  enableButtons(): void
  disableButtons(): void
  showLoading(buttonToReplace?: HTMLButtonElement | null): void
  hideLoading(): void
  isLoading(): boolean
  clickConfirm(): void
  clickDeny(): void
  clickCancel(): void
  showValidationMessage(validationMessage: string): void
  resetValidationMessage(): void
  getInput(): HTMLInputElement | null
  disableInput(): void
  enableInput(): void
  getValidationMessage(): HTMLElement | null
  getTimerLeft(): number | undefined
  stopTimer(): number | undefined
  resumeTimer(): number | undefined
  toggleTimer(): number | undefined
  isTimerRunning(): boolean | undefined
  increaseTimer(ms: number): number | undefined
  bindClickHandler(attribute?: string): void
  isValidParameter(paramName: string): paramName is keyof SwalTypes.SweetAlertOptions
  isUpdatableParameter(paramName: string): paramName is SwalTypes.SweetAlertUpdatableParameters
  argsToParams(
    params: SwalTypes.SweetAlertArrayOptions | readonly [SwalTypes.SweetAlertOptions]
  ): SwalTypes.SweetAlertOptions
  version: string
}
export interface NotyfService extends Notyf {}

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
 * @class SwalService
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
 * @class ToastService
 */
export const toast: ToastService = Swal.mixin(toastDefaults)

const sdbg = getDebugger('Sounds')
/**
 * The SoundsService manages the sounds which are available by exposing the {@link SoundsService.add} method, and allows sounds to be played using the {@link SoundsService.play} method.
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
 * @class NotyfService
 */
export const notyf: NotyfService = new Notyf({
  dismissible: true,
})
