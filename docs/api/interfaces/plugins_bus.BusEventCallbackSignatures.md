# Interface: BusEventCallbackSignatures

[plugins/bus](../modules/plugins_bus.md).BusEventCallbackSignatures

Describes the events and the signatures of their callbacks
Should be extended by the application to include all the events it needs

## Properties

### <a id="api:unauthorized" name="api:unauthorized"></a> api:unauthorized

• **api:unauthorized**: (`from?`: `string`) => `void`

Emitted when the API returns a 401 Unauthorized status

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:19](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L19)

___

### <a id="authentication:refreshable" name="authentication:refreshable"></a> authentication:refreshable

• **authentication:refreshable**: (`from?`: `string`) => `void`

The user's authentication token is eligible for refresh

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:95](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L95)

___

### <a id="firebase:token:updated" name="firebase:token:updated"></a> firebase:token:updated

• **firebase:token:updated**: (`token`: `undefined` \| `string`, `from?`: `string`) => `void`

The Firebase token has been updated

#### Type declaration

▸ (`token`, `from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `undefined` \| `string` | The new token |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:69](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L69)

___

### <a id="identity:login" name="identity:login"></a> identity:login

• **identity:login**: (`bearer`: `string`, `expiration`: `string`, `identity`: `UserIdentity`, `from?`: `string`) => `void`

The user has been authenticated and identified

#### Type declaration

▸ (`bearer`, `expiration`, `identity`, `from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bearer` | `string` | The bearer token |
| `expiration` | `string` | The expiration date of the token |
| `identity` | `UserIdentity` | The identity of the user |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:78](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L78)

___

### <a id="identity:logout" name="identity:logout"></a> identity:logout

• **identity:logout**: (`from?`: `string`) => `void`

The user has been logged out

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:89](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L89)

___

### <a id="push:notification" name="push:notification"></a> push:notification

• **push:notification**: (`payload`: `NotificationPayload`, `from?`: `string`) => `void`

A push notification has been received

#### Type declaration

▸ (`payload`, `from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | `NotificationPayload` | The payload of the notification |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:62](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L62)

___

### <a id="push:permission:denied" name="push:permission:denied"></a> push:permission:denied

• **push:permission:denied**: (`from?`: `string`) => `void`

The push service has been granted permission

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:49](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L49)

___

### <a id="push:permission:granted" name="push:permission:granted"></a> push:permission:granted

• **push:permission:granted**: (`from?`: `string`) => `void`

The push service has been denied permission

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:55](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L55)

___

### <a id="push:updated" name="push:updated"></a> push:updated

• **push:updated**: (`from?`: `string`) => `void`

The push service has been updated

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:43](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L43)

___

### <a id="tab:active" name="tab:active"></a> tab:active

• **tab:active**: (`from?`: `string`) => `void`

A tab has become active

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:32](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L32)

___

### <a id="tab:inactive" name="tab:inactive"></a> tab:inactive

• **tab:inactive**: (`from?`: `string`) => `void`

A tab has become inactive

#### Type declaration

▸ (`from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:37](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L37)

___

### <a id="tab:uuid" name="tab:uuid"></a> tab:uuid

• **tab:uuid**: (`uuid`: `string`, `active`: `boolean`, `from?`: `string`) => `void`

A tab has been updated

#### Type declaration

▸ (`uuid`, `active`, `from?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uuid` | `string` | The ID of the tab which has been updated |
| `active` | `boolean` | If the new tab is "active" or not |
| `from?` | `string` | The ID of the tab that triggered the event |

##### Returns

`void`

#### Defined in

[src/bus.ts:27](https://github.com/jakguru/vueprint/blob/cca61f2/src/bus.ts#L27)
