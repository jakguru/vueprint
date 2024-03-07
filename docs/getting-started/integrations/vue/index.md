# Integrating with Vue

There are 2 bootstraps for Vue, one which is environment agnostic, and one which is for client environments only. They are meant to be used as follows:

::: code-group

```typescript [entry-client.ts]
import VuePrintMainVueBootstrap from '@jakguru/vueprint/bootstraps/vue/main'
import VuePrintClientVueBootstrap from '@jakguru/vueprint/bootstraps/vue/client'
//...
app.use(VuePrintMainVueBootstrap, {
    //...
})
app.use(VuePrintClientVueBootstrap, {
    //...
})
```

```typescript [entry-server.ts]
import VuePrintMainVueBootstrap from '@jakguru/vueprint/bootstraps/vue/main'
//...
app.use(VuePrintMainVueBootstrap, {
    //...
})
```

:::

> [!CAUTION]
> Do not load the client bootstrap in a server environment as the libraries which it imports are not compatible and may cause unpredictable behavior.

For more information on their configuration, see:

* [bootstraps/vue/main API Documentation](/api/modules/bootstraps_vue_main)
* [bootstraps/vue/client API Documentation](/api/modules/bootstraps_vue_client)
