# Interface: TokenRefreshCallback

[services/identity](../modules/services_identity.md).TokenRefreshCallback

Describes the shape of the token refresh callback

## Callable

### TokenRefreshCallback

▸ **TokenRefreshCallback**(`api`, `signal`): [`TokenRefreshFeedback`](services_identity.TokenRefreshFeedback.md) \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`TokenRefreshFeedback`](services_identity.TokenRefreshFeedback.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | `Axios` |
| `signal` | `AbortSignal` |

#### Returns

[`TokenRefreshFeedback`](services_identity.TokenRefreshFeedback.md) \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`TokenRefreshFeedback`](services_identity.TokenRefreshFeedback.md)\>

#### Defined in

[src/services/identity.ts:32](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L32)
