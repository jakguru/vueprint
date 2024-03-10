# Class: SoundsService

[services/ui](../modules/services_ui.md).SoundsService

A service to manage sounds

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new SoundsService**(`sounds?`): [`SoundsService`](services_ui.SoundsService.md)

Creates a new SoundsService

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sounds?` | `Record`\<`string`, `string`\> | A map of sound names to their urls |

#### Returns

[`SoundsService`](services_ui.SoundsService.md)

#### Defined in

[src/services/ui.ts:65](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/ui.ts#L65)

## Methods

### <a id="add" name="add"></a> add

▸ **add**(`sounds`): `void`

Adds sounds to the service

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sounds` | `Record`\<`string`, `string`\> | A map of sound names to their urls |

#### Returns

`void`

#### Defined in

[src/services/ui.ts:76](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/ui.ts#L76)

___

### <a id="get" name="get"></a> get

▸ **get**(`key`): `Player`

Gets a sound from the service

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the sound to retrieve |

#### Returns

`Player`

The Tone.Player object for the sound

#### Defined in

[src/services/ui.ts:93](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/ui.ts#L93)

___

### <a id="play" name="play"></a> play

▸ **play**(`key`): `void`

Plays a sound

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the sound to play |

#### Returns

`void`

#### Defined in

[src/services/ui.ts:101](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/ui.ts#L101)

___

### <a id="stop" name="stop"></a> stop

▸ **stop**(`key`): `void`

Stops a sound

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the sound to stop |

#### Returns

`void`

#### Defined in

[src/services/ui.ts:113](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/ui.ts#L113)
