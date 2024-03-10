# Module: utilities

## Interfaces

- [ApplicationHook](../interfaces/utilities.ApplicationHook.md)
- [ApplicationHooks](../interfaces/utilities.ApplicationHooks.md)
- [ApplicationVueprintState](../interfaces/utilities.ApplicationVueprintState.md)

## Functions

### <a id="usevueprint" name="usevueprint"></a> useVueprint

▸ **useVueprint**(`hooks?`): [`ApplicationVueprintState`](../interfaces/utilities.ApplicationVueprintState.md)

Initialize the VuePrint integration with the application

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hooks?` | [`ApplicationHooks`](../interfaces/utilities.ApplicationHooks.md) | The hooks that will be used when an application property changes state |

#### Returns

[`ApplicationVueprintState`](../interfaces/utilities.ApplicationVueprintState.md)

An object containing the state of the application

#### Defined in

[src/utilities/index.ts:59](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/index.ts#L59)
