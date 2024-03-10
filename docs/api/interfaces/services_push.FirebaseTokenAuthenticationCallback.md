# Interface: FirebaseTokenAuthenticationCallback

[services/push](../modules/services_push.md).FirebaseTokenAuthenticationCallback

Describes the shape of the callback that is used to store the Firebase Messaging Token in an external service which requires it.

## Callable

### FirebaseTokenAuthenticationCallback

▸ **FirebaseTokenAuthenticationCallback**(`token`, `signal?`): `void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `signal?` | `AbortSignal` |

#### Returns

`void` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`void`\>

#### Defined in

[src/services/push.ts:39](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L39)
