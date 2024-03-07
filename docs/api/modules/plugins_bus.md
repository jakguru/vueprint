# Module: plugins/bus

## Interfaces

- [BusPluginOptions](../interfaces/plugins_bus.BusPluginOptions.md)

## Variables

### <a id="busplugin" name="busplugin"></a> BusPlugin

• `Const` **BusPlugin**: `Object`

A plugin for an event bus which supports events within the same window, across windows, and background push events

#### Type declaration

| Name | Type |
| :------ | :------ |
| `install` | (`app`: `App`\<`any`\>, `options?`: [`BusPluginOptions`](../interfaces/plugins_bus.BusPluginOptions.md)) => `void` |

#### Defined in

[plugins/bus.ts:23](https://github.com/jakguru/vueprint/blob/cb50a9e/plugins/bus.ts#L23)
