# Module: plugins/client

## Interfaces

- [VueClientBootstrapOptions](../interfaces/plugins_client.VueClientBootstrapOptions.md)

## Variables

### <a id="default" name="default"></a> default

• `Const` **default**: `Object`

A plugin which bootstraps all of the Vue plugins which can only be loaded in a client environment, in the correct order

#### Type declaration

| Name | Type |
| :------ | :------ |
| `install` | (`app`: `App`\<`any`\>, `options?`: [`VueClientBootstrapOptions`](../interfaces/plugins_client.VueClientBootstrapOptions.md)) => `void` |

#### Defined in

src/plugins/client.ts:16
