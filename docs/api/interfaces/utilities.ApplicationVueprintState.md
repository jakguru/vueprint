# Interface: ApplicationVueprintState

[utilities](../modules/utilities.md).ApplicationVueprintState

Defines the current state of the implementation of the VuePrint integration with the application

## Properties

### <a id="booted" name="booted"></a> booted

• **booted**: `ComputedRef`\<`boolean`\>

If all pre-mount services have been booted

#### Defined in

[src/utilities/index.ts:47](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/index.ts#L47)

___

### <a id="mounted" name="mounted"></a> mounted

• **mounted**: `Ref`\<`boolean`\>

If the application is currently mounted

#### Defined in

[src/utilities/index.ts:49](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/index.ts#L49)

___

### <a id="ready" name="ready"></a> ready

• **ready**: `ComputedRef`\<`boolean`\>

If all post-mount services have been booted

#### Defined in

[src/utilities/index.ts:51](https://github.com/jakguru/vueprint/blob/a4b4af4/src/utilities/index.ts#L51)
