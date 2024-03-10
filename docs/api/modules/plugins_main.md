# Module: plugins/main

## Interfaces

- [VueMainBootstrapOptions](../interfaces/plugins_main.VueMainBootstrapOptions.md)

## Variables

### <a id="default" name="default"></a> default

• `Const` **default**: `Object`

A plugin which bootstraps all of the Vue plugins which can be loaded in both a client and server environment, in the correct order

#### Type declaration

| Name | Type |
| :------ | :------ |
| `install` | (`app`: `App`\<`any`\>, `options?`: [`VueMainBootstrapOptions`](../interfaces/plugins_main.VueMainBootstrapOptions.md)) => `void` |

#### Defined in

src/plugins/main.ts:23
