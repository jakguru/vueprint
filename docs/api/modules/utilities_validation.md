# Module: utilities/validation

## Classes

- [ErrorWithTranslatedMessage](../classes/utilities_validation.ErrorWithTranslatedMessage.md)

## Functions

### <a id="getdeserializedschema" name="getdeserializedschema"></a> getDeserializedSchema

▸ **getDeserializedSchema**(`serialized`): `any`

Create a Joi schema from a serialized Joi schema

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | The serialized Joi schema |

#### Returns

`any`

A Joi schema

#### Defined in

[src/utilities/validation.ts:46](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/validation.ts#L46)

___

### <a id="getjoivalidationerrori18n" name="getjoivalidationerrori18n"></a> getJoiValidationErrorI18n

▸ **getJoiValidationErrorI18n**(`error`, `t`, `label?`): `any`

Get the translated error message for a Joi validation error

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `error` | `undefined` \| [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error ) | `undefined` | The error to translate |
| `t` | `any` | `undefined` | The translation function |
| `label` | `string` | `'the Field'` | The label of the field being validated |

#### Returns

`any`

The translated error message

#### Defined in

[src/utilities/validation.ts:58](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/validation.ts#L58)

___

### <a id="isvalidluhn" name="isvalidluhn"></a> isValidLuhn

▸ **isValidLuhn**(`input`): `boolean`

Check if a string is a valid Luhn number

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | ``null`` \| `string` | The input to check |

#### Returns

`boolean`

A boolean indicating whether the input is a valid Luhn number

#### Defined in

[src/utilities/validation.ts:16](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/validation.ts#L16)
