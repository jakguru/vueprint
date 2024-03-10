# Module: utilities/colors

## Functions

### <a id="colortocsscolor" name="colortocsscolor"></a> colorToCssColor

▸ **colorToCssColor**(`color`): `string`

Returns a CSS-safe color string

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `color` | `string` | The color to convert to a CSS color |

#### Returns

`string`

The css-safe color string

#### Defined in

src/utilities/colors.ts:56

___

### <a id="colortocsswithalpha" name="colortocsswithalpha"></a> colorToCssWithAlpha

▸ **colorToCssWithAlpha**(`color`, `alpha?`): `undefined` \| `string`

Convert a color from a variety of formats to an RGBA string

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `color` | `string` | `undefined` | The color to convert to an RGBA string |
| `alpha` | `number` | `1` | The alpha value to use for the RGBA string |

#### Returns

`undefined` \| `string`

an RGBA string

#### Defined in

src/utilities/colors.ts:156

___

### <a id="colortolottie" name="colortolottie"></a> colorToLottie

▸ **colorToLottie**(`color`, `alpha?`): `number`[]

Convert a color from a variety of formats to a Lottie color array

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `color` | `string` | `undefined` | The color to convert to a Lottie color array |
| `alpha` | `number` | `1` | The alpha value to use for the Lottie color array |

#### Returns

`number`[]

a Lottie color array

#### Defined in

src/utilities/colors.ts:191

___

### <a id="getcolormap" name="getcolormap"></a> getColorMap

▸ **getColorMap**(): `Map`\<`string`, `string`\>

Get a map of color names to their hex values

#### Returns

`Map`\<`string`, `string`\>

A map of color names to their hex values

#### Defined in

src/utilities/colors.ts:15

___

### <a id="hextorgba" name="hextorgba"></a> hexToRGBA

▸ **hexToRGBA**(`hex`, `alpha?`): `string`

Get an RGBA string from a hex color

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `hex` | `string` | `undefined` | The hex color to convert to an RGBA string |
| `alpha` | `number` | `1` | The alpha value to use for the RGBA string |

#### Returns

`string`

an RGBA string

#### Defined in

src/utilities/colors.ts:97

___

### <a id="hextorgbobject" name="hextorgbobject"></a> hexToRGBObject

▸ **hexToRGBObject**(`hex`): `Object`

Get the hex value of a color

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hex` | `string` | The hex color to convert to an RGB object |

#### Returns

`Object`

an object with the r, g, and b values of the hex color

| Name | Type |
| :------ | :------ |
| `b` | `number` |
| `g` | `number` |
| `r` | `number` |

#### Defined in

src/utilities/colors.ts:76

___

### <a id="hsltorgb" name="hsltorgb"></a> hslToRgb

▸ **hslToRgb**(`h`, `s`, `l`): `number`[]

Converts an HSL color value to RGB. Conversion formula
adapted from https://en.wikipedia.org/wiki/HSL_color_space.
Assumes h, s, and l are contained in the set [0, 1] and
returns r, g, and b in the set [0, 255].

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `h` | `number` | The hue |
| `s` | `number` | The saturation |
| `l` | `number` | The lightness |

#### Returns

`number`[]

The RGB representation

#### Defined in

src/utilities/colors.ts:132

___

### <a id="huetorgb" name="huetorgb"></a> hueToRgb

▸ **hueToRgb**(`p`, `q`, `t`): `number`

Converts a Hue value to its RGB representation, given intermediary values calculated from lightness and saturation.
This function is a helper function, typically used within a larger algorithm to convert HSL colors to RGB format.
It interpolates the RGB value based on the hue's position within its segment of the color wheel.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `number` | An intermediary value calculated from the lightness, used to adjust the RGB value based on the lightness. |
| `q` | `number` | Another intermediary value calculated from the lightness and saturation, used to fine-tune the RGB adjustment. |
| `t` | `number` | Represents the hue component adjusted to fit within one of three ranges for RGB conversion. It should be modified based on the specific RGB channel (red, green, blue) being calculated. |

#### Returns

`number`

The calculated RGB value (for a single channel: R, G, or B) based on the input hue and intermediary values.

#### Defined in

src/utilities/colors.ts:112
