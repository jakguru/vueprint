# Class: PushService

[services/push](../modules/services_push.md).PushService

A service which manages desktop notifications and integration with Firebase Messaging.

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new PushService**(`bus`, `ls`, `cron`, `identity`, `firebaseOptions`, `onAuthenticatedForFirebase`, `onUnauthenticatedForFirebase`, `serviceWorkerPath?`, `serviceWorkerMode?`): [`PushService`](services_push.PushService.md)

Create a new PushService instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bus` | [`BusService`](services_bus.BusService.md) | The BusService instance to use for communication |
| `ls` | [`LocalStorageService`](services_localStorage.LocalStorageService.md) | The LocalStorageService instance to use for storing and retrieving preferences and tokens |
| `cron` | `MiliCron` | The MiliCron instance to use for scheduling updates |
| `identity` | [`IdentityService`](services_identity.IdentityService.md) | The IdentityService instance to use for determining if the user is authenticated |
| `firebaseOptions` | `FirebaseOptions` | The options to use for initializing Firebase |
| `onAuthenticatedForFirebase` | [`FirebaseTokenAuthenticationCallback`](../interfaces/services_push.FirebaseTokenAuthenticationCallback.md) | The callback to use for storing the Firebase Messaging Token in an external service when the user is authenticated |
| `onUnauthenticatedForFirebase` | [`FirebaseTokenAuthenticationCallback`](../interfaces/services_push.FirebaseTokenAuthenticationCallback.md) | The callback to use for removing the Firebase Messaging Token from an external service when the user is unauthenticated |
| `serviceWorkerPath?` | ``null`` \| `string` | The path to the service worker to use for handling push notifications |
| `serviceWorkerMode?` | ``null`` \| ``"classic"`` \| ``"module"`` | The mode to use for the service worker |

#### Returns

[`PushService`](services_push.PushService.md)

#### Defined in

[src/services/push.ts:102](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L102)

## Accessors

### <a id="booted" name="booted"></a> booted

• `get` **booted**(): `Ref`\<`boolean`\>

Whether or not the service has been booted.

#### Returns

`Ref`\<`boolean`\>

#### Defined in

[src/services/push.ts:186](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L186)

___

### <a id="canpush" name="canpush"></a> canPush

• `get` **canPush**(): `ComputedRef`\<``null`` \| `boolean`\>

Whether or not permissions have been granted for push notifications.

#### Returns

`ComputedRef`\<``null`` \| `boolean`\>

#### Defined in

[src/services/push.ts:200](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L200)

___

### <a id="canrequestpermission" name="canrequestpermission"></a> canRequestPermission

• `get` **canRequestPermission**(): `ComputedRef`\<`boolean`\>

Whether or not the UI should show a prompt for the user to allow push notifications.

#### Returns

`ComputedRef`\<`boolean`\>

#### Defined in

[src/services/push.ts:193](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L193)

## Methods

### <a id="boot" name="boot"></a> boot

▸ **boot**(): `void`

Boot the service.

#### Returns

`void`

#### Defined in

[src/services/push.ts:297](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L297)

___

### <a id="createwebpushnotification" name="createwebpushnotification"></a> createWebPushNotification

▸ **createWebPushNotification**(`options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WebPushNotificationOptions`](../interfaces/services_push.WebPushNotificationOptions.md) |

#### Returns

`void`

#### Defined in

[src/services/push.ts:234](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L234)

___

### <a id="donotrequestpushpermission" name="donotrequestpushpermission"></a> doNotRequestPushPermission

▸ **doNotRequestPushPermission**(): `void`

Stop asking the user for permission to show push notifications.

#### Returns

`void`

void

#### Defined in

[src/services/push.ts:226](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L226)

___

### <a id="requestpushpermission" name="requestpushpermission"></a> requestPushPermission

▸ **requestPushPermission**(): `void`

Request permission to show push notifications.

#### Returns

`void`

#### Defined in

[src/services/push.ts:207](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L207)

___

### <a id="shutdown" name="shutdown"></a> shutdown

▸ **shutdown**(): `void`

Shut down the service.

#### Returns

`void`

#### Defined in

[src/services/push.ts:456](https://github.com/jakguru/vueprint/blob/a4b4af4/src/services/push.ts#L456)
