# Configuration of VuePrint

The configuration of VuePrint is meant to be simple and easy, while providing the most flexibility where needed and / or possible.

## Nuxt Module Configuration Options

| Key | Type | Description |
| --- | --- | --- |
| `api` | [ApiPluginOptions](/api/interfaces/plugins_api.ApiPluginOptions) | Defines the options for the API Service |
| `bus` | [BusPluginOptions](/api/interfaces/plugins_bus.BusPluginOptions) | Defines the options for the Bus Service |
| `identity` | [IdentityPluginOptions](/api/interfaces/plugins_identity.IdentityPluginOptions) | Defines the options for the Identity Service |
| `ls` | [LocalStoragePluginOptions](/api/interfaces/plugins_ls.LocalStoragePluginOptions) | Defines the options for the Local Storage Service |
| `push` | [PushPluginOptions](/api/interfaces/plugins_push.PushPluginOptions) | Defines the options for the Local Storage Service |
| `ui` | [UiPluginOptions](/api/interfaces/plugins_ui.UiPluginOptions) | Defines the list of options for the UI Service |
| `vuetify` | [VuetifyPluginOptions](/api/interfaces/plugins_vuetify.VuetifyPluginOptions) | Defines the list options for the Vuetify Service |

## Vue Main Plugin Options

| Key | Type | Description |
| --- | --- | --- |
| `api` | [ApiPluginOptions](/api/interfaces/plugins_api.ApiPluginOptions) | Defines the options for the API Service |
| `bus` | [BusPluginOptions](/api/interfaces/plugins_bus.BusPluginOptions) | Defines the options for the Bus Service |
| `identity` | [IdentityPluginOptions](/api/interfaces/plugins_identity.IdentityPluginOptions) | Defines the options for the Identity Service |
| `ls` | [LocalStoragePluginOptions](/api/interfaces/plugins_ls.LocalStoragePluginOptions) | Defines the options for the Local Storage Service |
| `vuetify` | [VuetifyPluginOptions](/api/interfaces/plugins_vuetify.VuetifyPluginOptions) | Defines the list options for the Vuetify Service |

## Vue Client Plugin Options

| Key | Type | Description |
| --- | --- | --- |
| `push` | [PushPluginOptions](/api/interfaces/plugins_push.PushPluginOptions) | Defines the options for the Local Storage Service |
| `ui` | [UiPluginOptions](/api/interfaces/plugins_ui.UiPluginOptions) | Defines the list of options for the UI Service |

## ApiPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `baseURL` | `string` | The Base URL of the API Service being integrated with |

## BusPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `namespace` | `string` | The namespace to use in the `broadcast-channel` to ensure that messages are sent and received between tabs |

## IdentityPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `tokenRefresh` | [TokenRefreshCallback](/api/interfaces/services_identity.TokenRefreshCallback) | The function which will be triggered by the identity service to attempt to refresh the `bearer` authentication when the it is close to expiring |
| `tokenRefreshBuffer` | `number` | The amount of time in milliseconds before the token expires before a token is considered refreshable (default: 5 minutes) |

## LocalStoragePluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `namespace` | `string` | The namespace under which all of the information for the local storage will be stored and encrypted |

## PushPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `firebaseOptions` | [FirebaseOptions](https://firebase.google.com/docs/reference/js/app.firebaseoptions) | Firebase configuration object. Contains a set of parameters required by services in order to successfully communicate with Firebase server APIs and to associate client data with your Firebase project and Firebase application. |
| `onAuthenticatedForFirebase` | [FirebaseTokenAuthenticationCallback](/api/interfaces/services_push.FirebaseTokenAuthenticationCallback) | The callback that is used to store the Firebase Messaging Token in an external service which requires it. |
| `onUnauthenticatedForFirebase` | [FirebaseTokenAuthenticationCallback](/api/interfaces/services_push.FirebaseTokenAuthenticationCallback) | The callback that is used to inform an external service that a token is no longer associated with a user |
| `serviceWorkerMode` | `null`, `"classic"`, `"module"` | The mode which is used to load the service worker for interacting with Firebase |
| `serviceWorkerPath` | `null` or `string` | The absolute URL pathname of the service worker which should be loaded |

## UiPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `sounds` | `Record<string, string>` | An object in `key`:`url` format with a list of sounds which should be loaded on boot |

## VuetifyPluginOptions Options

| Key | Type | Description |
| --- | --- | --- |
| `defaultTheme` | `string` | The primary theme that will be loaded on boot |
| `themes` | [VuetifiableThemes](/api/interfaces/services_vuetify.VuetifiableThemes) | An object which defines the themes available to Vuetify |
| `options` | [VuetifyOptions](https://vuetifyjs.com/en/features/global-configuration/#setup) | An object defining the remaining options availeble to configure Vuetify with. Options relating to themes will be overwritten with information inferred from the options passed in the `defaultTheme` and `themes` options |

## VuetifiableTheme Options

The [VuetifiableTheme](/api/interfaces/services_vuetify.VuetifiableTheme) Interface is an update for Vuetify's built-in [ThemeDefinition](https://vuetifyjs.com/en/features/theme/#api) object with the following changes:

| Key | Type | Description |
| --- | --- | --- |
| `colors` | [VuetifiableColors](/api/interfaces/services_vuetify.VuetifiableColors) | An object in `key`:`color` format which defines the colors which will be used by the Vuetify theme |
