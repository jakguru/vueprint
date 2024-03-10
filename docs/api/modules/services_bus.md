# Module: services/bus

## Classes

- [BusService](../classes/services_bus.BusService.md)

## Interfaces

- [BusEventCallbackSignatures](../interfaces/services_bus.BusEventCallbackSignatures.md)
- [BusEventListenOptions](../interfaces/services_bus.BusEventListenOptions.md)

## Type Aliases

### <a id="busevent" name="busevent"></a> BusEvent

Ƭ **BusEvent**: keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md)

The events that can be emitted and listened to

#### Defined in

[src/services/bus.ts:101](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L101)

___

### <a id="buseventalreadytriggered" name="buseventalreadytriggered"></a> BusEventAlreadyTriggered

Ƭ **BusEventAlreadyTriggered**: \{ [key in keyof BusEventCallbackSignatures]: Parameters\<BusEventCallback\<key\>\> }

The events that have already been triggered

#### Defined in

[src/services/bus.ts:112](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L112)

___

### <a id="buseventcallback" name="buseventcallback"></a> BusEventCallback

Ƭ **BusEventCallback**\<`T`\>: [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md)[`T`]

The callback signatures for the events

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md) |

#### Defined in

[src/services/bus.ts:106](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L106)

___

### <a id="buseventemitoptions" name="buseventemitoptions"></a> BusEventEmitOptions

Ƭ **BusEventEmitOptions**: `Omit`\<[`BusEventListenOptions`](../interfaces/services_bus.BusEventListenOptions.md), ``"immediate"``\>

Options for listening to events

#### Defined in

[src/services/bus.ts:132](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L132)

## Functions

### <a id="shortid" name="shortid"></a> shortid

▸ **shortid**(): `string`

Generate a likely unique short ID for identifying tabs

#### Returns

`string`

A short ID

#### Defined in

[src/services/bus.ts:138](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L138)
