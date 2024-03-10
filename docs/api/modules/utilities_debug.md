# Module: utilities/debug

## Functions

### <a id="getdebugger" name="getdebugger"></a> getDebugger

▸ **getDebugger**(`name`, `color?`, `background?`): (...`args`: `any`[]) => `void`

Generate a function that will log messages to the console

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | The name that will be used to prefix the log messages |
| `color` | `string` | `'#34495E'` | The color of the text in the name |
| `background` | `string` | `'#41B883'` | The color of the background in the name |

#### Returns

`fn`

A function that will log messages to the console

▸ (`...args`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`void`

#### Defined in

[src/utilities/debug.ts:9](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/debug.ts#L9)
