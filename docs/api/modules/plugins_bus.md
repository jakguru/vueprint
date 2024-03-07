# Module: plugins/bus

## Interfaces

- [BusEventCallbackSignatures](../interfaces/plugins_bus.BusEventCallbackSignatures.md)
- [BusEventListenOptions](../interfaces/plugins_bus.BusEventListenOptions.md)
- [BusPluginOptions](../interfaces/plugins_bus.BusPluginOptions.md)

## Type Aliases

### <a id="busevent" name="busevent"></a> BusEvent

Ƭ **BusEvent**: keyof [`BusEventCallbackSignatures`](../interfaces/plugins_bus.BusEventCallbackSignatures.md)

The events that can be emitted and listened to

#### Defined in

[src/bus.ts:101](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L101)

___

### <a id="buseventalreadytriggered" name="buseventalreadytriggered"></a> BusEventAlreadyTriggered

Ƭ **BusEventAlreadyTriggered**: \{ [key in keyof BusEventCallbackSignatures]: Parameters\<BusEventCallback\<key\>\> }

The events that have already been triggered

#### Defined in

[src/bus.ts:112](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L112)

___

### <a id="buseventcallback" name="buseventcallback"></a> BusEventCallback

Ƭ **BusEventCallback**\<`T`\>: [`BusEventCallbackSignatures`](../interfaces/plugins_bus.BusEventCallbackSignatures.md)[`T`]

The callback signatures for the events

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof [`BusEventCallbackSignatures`](../interfaces/plugins_bus.BusEventCallbackSignatures.md) |

#### Defined in

[src/bus.ts:106](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L106)

___

### <a id="buseventemitoptions" name="buseventemitoptions"></a> BusEventEmitOptions

Ƭ **BusEventEmitOptions**: `Omit`\<[`BusEventListenOptions`](../interfaces/plugins_bus.BusEventListenOptions.md), ``"immediate"``\>

Options for listening to events

#### Defined in

[src/bus.ts:132](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L132)

## Variables

### <a id="busplugin" name="busplugin"></a> BusPlugin

• `Const` **BusPlugin**: `Object`

A plugin for an event bus which supports events within the same window, across windows, and background push events

#### Type declaration

| Name | Type |
| :------ | :------ |
| `install` | (`app`: `App`\<`any`\>, `options?`: [`BusPluginOptions`](../interfaces/plugins_bus.BusPluginOptions.md)) => `void` |

#### Defined in

[plugins/bus.ts:31](https://github.com/jakguru/vueprint/blob/cca61f2/plugins/bus.ts#L31)
