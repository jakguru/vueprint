# Class: BusService

[services/bus](../modules/services_bus.md).BusService

A bus for transmitting and subscribing to events acrosss components and tabs

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new BusService**(`namespace?`): [`BusService`](services_bus.BusService.md)

Create a new bus

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `namespace?` | `string` | The namespace for the BroadcastChannel |

#### Returns

[`BusService`](services_bus.BusService.md)

#### Defined in

[src/services/bus.ts:159](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L159)

## Accessors

### <a id="active" name="active"></a> active

• `get` **active**(): `ComputedRef`\<`boolean`\>

Whether the tab is active

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/bus.ts:225](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L225)

___

### <a id="inactivetoolong" name="inactivetoolong"></a> inactiveTooLong

• `get` **inactiveTooLong**(): `ComputedRef`\<`boolean`\>

Whether the tab has been inactive for too long and should have reduced functionality
to save user resources

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/bus.ts:233](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L233)

___

### <a id="uuid" name="uuid"></a> uuid

• `get` **uuid**(): `string`

The UUID of the tab

#### Returns

`string`

#### Defined in

[src/services/bus.ts:218](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L218)

## Methods

### <a id="emit" name="emit"></a> emit

▸ **emit**\<`K`\>(`event`, `options?`, `...args`): `void`

Trigger an event

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The name of the event to emit |
| `options` | [`BusEventListenOptions`](../interfaces/services_bus.BusEventListenOptions.md) | The options for emitting the event |
| `...args` | `Parameters`\<[`BusEventCallback`](../modules/services_bus.md#buseventcallback)\<`K`\>\> | The arguments to pass to the event |

#### Returns

`void`

#### Defined in

[src/services/bus.ts:341](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L341)

___

### <a id="getactivetabs" name="getactivetabs"></a> getActiveTabs

▸ **getActiveTabs**(`wait?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`string`[]\>

Get the active tabs

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `wait` | `number` | `500` | The time to wait before returning the active tabs |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`string`[]\>

The active tabs

#### Defined in

[src/services/bus.ts:363](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L363)

___

### <a id="ismain" name="ismain"></a> isMain

▸ **isMain**(`wait?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`boolean`\>

Check if the tab is the main tab

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `wait` | `number` | `500` | The time to wait before returning the active tabs |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`boolean`\>

Whether the tab is the main tab

#### Defined in

[src/services/bus.ts:397](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L397)

___

### <a id="off" name="off"></a> off

▸ **off**\<`K`\>(`event`, `callback`, `options?`): `void`

Stop listening to an event

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The event to stop listening to |
| `callback` | [`BusEventCallback`](../modules/services_bus.md#buseventcallback)\<`K`\> | The callback to remove from the event |
| `options` | [`BusEventListenOptions`](../interfaces/services_bus.BusEventListenOptions.md) | The options for stopping listening to the event |

#### Returns

`void`

#### Defined in

[src/services/bus.ts:285](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L285)

___

### <a id="on" name="on"></a> on

▸ **on**\<`K`\>(`event`, `callback`, `options?`): `void`

Listen to an event

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The event to listen to |
| `callback` | [`BusEventCallback`](../modules/services_bus.md#buseventcallback)\<`K`\> | The callback to call when the event is emitted |
| `options` | [`BusEventListenOptions`](../interfaces/services_bus.BusEventListenOptions.md) | The options for listening to the event |

#### Returns

`void`

#### Defined in

[src/services/bus.ts:248](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L248)

___

### <a id="once" name="once"></a> once

▸ **once**\<`K`\>(`event`, `callback`, `options?`): `void`

Listen to an event once

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`BusEventCallbackSignatures`](../interfaces/services_bus.BusEventCallbackSignatures.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The event to listen to |
| `callback` | [`BusEventCallback`](../modules/services_bus.md#buseventcallback)\<`K`\> | The callback to call when the event is emitted |
| `options` | [`BusEventListenOptions`](../interfaces/services_bus.BusEventListenOptions.md) | The options for listening to the event |

#### Returns

`void`

#### Defined in

[src/services/bus.ts:304](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/bus.ts#L304)
