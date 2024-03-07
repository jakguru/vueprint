# Getting Started with VuePrint

## Installation

You can install VuePrint with your favorite javascript package manager.

::: code-group

```bash [npm]
npm i @jakguru/vueprint
```

```bash [yarn]
yarn add @jakguru/vueprint
```

:::

## Preparing for Integration

In order to be able to extend VuePrint's services to fit your application, you should extend some of the type defintitions to include your own customizations. For example:

```typescript
declare module '@jakguru/vueprint' {
    interface BusEventCallbackSignatures {
        '<name of your new event>': (from?: string) => void,
        '<name of your new event with some arguments>': (arg1: string, arg2: any, from?: string) => void
    }
}
```

## Integrating into a project

VitePrint provides "Bootstrap" plugins for pure Vue projects, and a module for Nuxt projects

### Vue Bootstraps

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
