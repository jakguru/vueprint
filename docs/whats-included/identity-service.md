# Identity Service

The Identity service is used to share the authentication state and user information across the application and across all instances of the application in the same browser, as well as to authenticate any API request made on behalf of the user.

## Accessing the Identity Service

The Identity Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { IdentityService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const identity = inject<IdentityService>('identity')
        return {}
    }
    mounted() {
        const identity: IdentityService = this.config.globalProperties.$identity
    }
})
</script>
```

## Using the Identity Service

::: info
For more specifics, see the [IdentityService API Documentation](/api/classes/services_identity.IdentityService)
:::

### Determining Authentication State and Current User

The `IdentityService.authenticated` accessor provides an easy way to determine if the visitor has been authenticated. It does **not** determine if the current user has been identified (meaning that information about the user has been saved to the local storage), however in most cases that information will be available very soon after the value of `IdentityService.authenticated.value` is true.

The `IdentityService.identified` accessor provides an easy way to determine if the visitor has been identified. This means that the `IdentityService.user` object has been created with at least 1 parameter.

### Setting the authentication state

Because VuePrint does not provide any forms, it provides a method for a form to store the authentication information in the appropriate locations in the local storage. This method is `IdentityService.login`, and it accepts 3 arguments:

* The `bearer` token which will be used to make authenticated API calls
* The expiration timestamp of the bearer token
* An object which is used as the user identifier

### Deauthenticating a visitor

To remove the authentication and identity information of the currently logged in user, simply call the `IdentityService.logout` method. It accepts no arguments.
