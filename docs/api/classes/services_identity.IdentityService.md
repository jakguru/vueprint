# Class: IdentityService

[services/identity](../modules/services_identity.md).IdentityService

A service for managing the authentication state and identity of a user
Uses LocalStorageService, BusService, and Axios instances to manage the state of the user's identity across tabs

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new IdentityService**(`bus`, `ls`, `cron`, `api`, `tokenRefresh`, `tokenRefreshBuffer?`): [`IdentityService`](services_identity.IdentityService.md)

Create a new Identity instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bus` | [`BusService`](services_bus.BusService.md) | A BusService instance |
| `ls` | [`LocalStorageService`](services_localStorage.LocalStorageService.md) | A LocalStorageService instance |
| `cron` | `MiliCron` | A MiliCron instance |
| `api` | `Axios` | An Axios instance |
| `tokenRefresh` | [`TokenRefreshCallback`](../interfaces/services_identity.TokenRefreshCallback.md) | A token refresh callback |
| `tokenRefreshBuffer` | `number` | The amount of time in milliseconds before the token expires before a token is considered refreshable (default: 5 minutes) |

#### Returns

[`IdentityService`](services_identity.IdentityService.md)

#### Defined in

[src/services/identity.ts:68](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L68)

## Accessors

### <a id="authenticated" name="authenticated"></a> authenticated

• `get` **authenticated**(): `ComputedRef`\<`boolean`\>

Whether or not the visitor is authenticated

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/identity.ts:147](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L147)

___

### <a id="booted" name="booted"></a> booted

• `get` **booted**(): `Ref`\<`boolean`\>

Whether or not the Identity service has booted

#### Returns

`Ref`\<`boolean`\>

#### Defined in

[src/services/identity.ts:140](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L140)

___

### <a id="identified" name="identified"></a> identified

• `get` **identified**(): `ComputedRef`\<`boolean`\>

Whether or not the visitor is identified

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/identity.ts:154](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L154)

___

### <a id="refreshable" name="refreshable"></a> refreshable

• `get` **refreshable**(): `ComputedRef`\<`boolean`\>

Whether or not the token is refreshable

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/identity.ts:168](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L168)

___

### <a id="ttl" name="ttl"></a> ttl

• `get` **ttl**(): `Ref`\<`undefined` \| `number`\>

The time until the authentication expires

#### Returns

`Ref`\<`undefined` \| `number`\>

#### Defined in

[src/services/identity.ts:175](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L175)

___

### <a id="user" name="user"></a> user

• `get` **user**(): `ComputedRef`\<`undefined` \| [`UserIdentity`](../interfaces/services_identity.UserIdentity.md)\>

The user's identity

#### Returns

`ComputedRef`\<`undefined` \| [`UserIdentity`](../interfaces/services_identity.UserIdentity.md)\>

#### Defined in

[src/services/identity.ts:161](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L161)

## Methods

### <a id="boot" name="boot"></a> boot

▸ **boot**(): `void`

Boot the Identity service

#### Returns

`void`

#### Defined in

[src/services/identity.ts:230](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L230)

___

### <a id="login" name="login"></a> login

▸ **login**(`bearer`, `expiration`, `identity`): `void`

Save the bearer token, expiration, and user identity to the LocalStorageService and update the authentication & identification state

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bearer` | `string` | The bearer token |
| `expiration` | `string` | The expiration time of the token |
| `identity` | [`UserIdentity`](../interfaces/services_identity.UserIdentity.md) | The user's identity |

#### Returns

`void`

void

#### Defined in

[src/services/identity.ts:186](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L186)

___

### <a id="logout" name="logout"></a> logout

▸ **logout**(): `void`

Remove the bearer token, expiration, and user identity from the LocalStorageService and update the authentication & identification state

#### Returns

`void`

void

#### Defined in

[src/services/identity.ts:214](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L214)

___

### <a id="shutdown" name="shutdown"></a> shutdown

▸ **shutdown**(): `void`

Shutdown the Identity service

#### Returns

`void`

#### Defined in

[src/services/identity.ts:295](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/identity.ts#L295)
