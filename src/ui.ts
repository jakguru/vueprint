import Swal from 'sweetalert2'
import merge from 'lodash.merge'

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
