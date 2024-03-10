# Class: LocalStorageService

[services/localStorage](../modules/services_localStorage.md).LocalStorageService

A SSR-friendly local storage service that uses secure-ls to store and retrieve data.

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new LocalStorageService**(`namespace`): [`LocalStorageService`](services_localStorage.LocalStorageService.md)

Create a new LocalStorage instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `namespace` | `string` | The namespace to use for the local storage. |

#### Returns

[`LocalStorageService`](services_localStorage.LocalStorageService.md)

#### Defined in

[src/services/localStorage.ts:28](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L28)

## Accessors

### <a id="loaded" name="loaded"></a> loaded

• `get` **loaded**(): `boolean`

Whether or not the local storage has been loaded.

#### Returns

`boolean`

#### Defined in

[src/services/localStorage.ts:90](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L90)

___

### <a id="promise" name="promise"></a> promise

• `get` **promise**(): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`void`\>

A promise which resolves when the local storage has been loaded.

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`void`\>

#### Defined in

[src/services/localStorage.ts:97](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L97)

___

### <a id="value" name="value"></a> value

• `get` **value**(): `Record`\<`string`, `any`\>

The current content of the local storage.

#### Returns

`Record`\<`string`, `any`\>

#### Defined in

[src/services/localStorage.ts:104](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L104)

## Methods

### <a id="clear" name="clear"></a> clear

▸ **clear**(): `void`

Clear the local storage.

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:274](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L274)

___

### <a id="get" name="get"></a> get

▸ **get**(`key`): `any`

Get the value of a key in the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to fetch from the local storage. |

#### Returns

`any`

The value of the key in the local storage, if it exists

#### Defined in

[src/services/localStorage.ts:167](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L167)

___

### <a id="getallkeys" name="getallkeys"></a> getAllKeys

▸ **getAllKeys**(): `string`[]

Get all of the keys in the local storage.

#### Returns

`string`[]

An array of all of the keys in the local storage.

#### Defined in

[src/services/localStorage.ts:190](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L190)

___

### <a id="getdatafromlocalstorage" name="getdatafromlocalstorage"></a> getDataFromLocalStorage

▸ **getDataFromLocalStorage**(`key`): ``null`` \| `string`

Get the value of a key in the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to fetch from the local storage. |

#### Returns

``null`` \| `string`

The value of the key in the local storage, if it exists

#### Defined in

[src/services/localStorage.ts:179](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L179)

___

### <a id="getencryptionsecret" name="getencryptionsecret"></a> getEncryptionSecret

▸ **getEncryptionSecret**(): `string`

Get the encryption secret used by the local storage.

#### Returns

`string`

#### Defined in

[src/services/localStorage.ts:153](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L153)

___

### <a id="merge" name="merge"></a> merge

▸ **merge**(`data`): `void`

Merge data into the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `any` | The data to merge into the local storage. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:228](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L228)

___

### <a id="off" name="off"></a> off

▸ **off**(`event`, `callback`): `void`

Remove a listener for an event on the local bus.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `string` | The event name. |
| `callback` | (...`args`: `any`[]) => `void` | The callback function. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:308](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L308)

___

### <a id="on" name="on"></a> on

▸ **on**(`event`, `callback`): `void`

Add a listener for an event on the local bus.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `string` | The event name. |
| `callback` | (...`args`: `any`[]) => `void` | The callback function. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:299](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L299)

___

### <a id="once" name="once"></a> once

▸ **once**(`event`, `callback`): `void`

Add a listener for an event on the local bus one time

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `string` | The event name. |
| `callback` | (...`args`: `any`[]) => `void` | The callback function. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:317](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L317)

___

### <a id="refresh" name="refresh"></a> refresh

▸ **refresh**(): `void`

Refresh the information in the service from the browser's local storage.

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:133](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L133)

___

### <a id="remove" name="remove"></a> remove

▸ **remove**(`key`): `void`

Remove a key from the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to remove from the local storage. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:252](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L252)

___

### <a id="removeall" name="removeall"></a> removeAll

▸ **removeAll**(): `void`

Remove all keys from the local storage.

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:263](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L263)

___

### <a id="resetallkeys" name="resetallkeys"></a> resetAllKeys

▸ **resetAllKeys**(): []

Reset all keys in the local storage.

#### Returns

[]

#### Defined in

[src/services/localStorage.ts:287](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L287)

___

### <a id="set" name="set"></a> set

▸ **set**(`key`, `data`): `void`

Set the value of a key in the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to set in the local storage. |
| `data` | `any` | The value to set for the key in the local storage. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:202](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L202)

___

### <a id="setdatatolocalstorage" name="setdatatolocalstorage"></a> setDataToLocalStorage

▸ **setDataToLocalStorage**(`key`, `data`): `void`

Set the value of a key in the local storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to set in the local storage. |
| `data` | `string` | The value to set for the key in the local storage. |

#### Returns

`void`

#### Defined in

[src/services/localStorage.ts:241](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/localStorage.ts#L241)
