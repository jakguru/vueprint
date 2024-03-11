# UI Service

The UI Service provides libraries which can be used in conjunction with Vuetify to provide a user feedback. It provides specific services for:

* [SweetAlert2 Alerts](https://sweetalert2.github.io/)
* [SweetAlert2 Toasts](https://sweetalert2.github.io/)
* [Notyf Toasts](https://github.com/caroso1222/notyf)
* [Tone Audio Players](https://tonejs.github.io/)

## Accessing the UI Service

The UI Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { SwalService, ToastService, NotyfService, SoundsService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const swal = inject<SwalService>('swal')
        const toast = inject<ToastService>('toast')
        const notyf = inject<NotyfService>('notyf')
        const sounds = inject<SoundsService>('sounds')
        return {}
    }
    mounted() {
        const swal: SwalService = this.config.globalProperties.$swal
        const toast: ToastService = this.config.globalProperties.$toast
        const notyf: NotyfService = this.config.globalProperties.$notyf
        const sounds: SoundsService = this.config.globalProperties.$sounds
    }
})
</script>
```

## Using the UI Service

::: info
For more specifics, see the [UI API Documentation](/api/modules/services_ui)
:::

### SweetAlert2 Alerts

The built in SweetAlert2 Alerts are styled to match the theme of the application using Vuetify's styling classes.

For in-depth specifications, please see the [SweetAlert2 Documentation](https://sweetalert2.github.io/)

### SweetAlert2 Toasts

The built in SweetAlert2 Toasts are configured to show a toast notification which is styled to match the theme of the application using Vuetify's styling classes.

For in-depth specifications, please see the [SweetAlert2 Documentation](https://sweetalert2.github.io/)

### Notyf Toasts

The built in Notyf integration simply provides the integration as-is without any specific changes or modifications. The main advantage of using Notyf over SweetAlert2 Toasts is that you can have multiple toasts show at the same time.

For in-depth specifications, please see the [Notyf Documentation](https://github.com/caroso1222/notyf)

### SoundsService

The SoundsService manages the sounds which are available by exposing the `SoundsService.add` method, and allows sounds to be played using the `SoundsService.play` method.

::: info
For more specifics, see the [SoundsService API Documentation](/api/classes/services_ui.SoundsService)
:::
