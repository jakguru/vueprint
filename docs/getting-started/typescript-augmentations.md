# Typescript Augmentations

In order to be able to extend VuePrint's services to fit your application, you should extend some of the type defintitions to include your own customizations.

## The `BusEventCallbackSignatures` Interface

The `BusEventCallbackSignatures` interface is used by the bus to determine which events are expected and what the function which is called when that event occurs should look like.

For more information and examples, see [the BusEventCallbackSignatures Documentation](/api/interfaces/jakguru_vueprint_services_bus.BusEventCallbackSignatures)

```typescript
declare module '@jakguru/vueprint' {
    interface BusEventCallbackSignatures {
        '<name of your new event>': (from?: string) => void,
        '<name of your new event with some arguments>': (arg1: string, arg2: any, from?: string) => void
    }
}
```
