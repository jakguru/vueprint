declare module '#app' {
  interface PluginMeta {
    name?: string
    enforce?: 'pre' | 'default' | 'post'
    /**
     * Await for other named plugins to finish before running this plugin.
     */
    dependsOn?: NuxtAppLiterals['pluginName'][]
    /**
     * This allows more granular control over plugin order and should only be used by advanced users.
     * It overrides the value of `enforce` and is used to sort plugins.
     */
    order?: number
  }
  interface ObjectPlugin<Injections extends Record<string, unknown> = Record<string, unknown>>
    extends PluginMeta {
    hooks?: Partial<RuntimeNuxtHooks>
    setup?: Plugin<Injections>
    env?: PluginEnvContext
    /**
     * Execute plugin in parallel with other parallel plugins.
     * @default false
     */
    parallel?: boolean
    /**
     * @internal
     */
    _name?: string
  }
  interface Plugin<Injections extends Record<string, unknown> = Record<string, unknown>> {
    (nuxt: _NuxtApp):
      | Promise<void>
      | Promise<{
          provide?: Injections
        }>
      | void
      | {
          provide?: Injections
        }
    [NuxtPluginIndicator]?: true
    meta?: ResolvedPluginMeta
  }
  interface ObjectPlugin<Injections extends Record<string, unknown> = Record<string, unknown>>
    extends PluginMeta {
    hooks?: Partial<RuntimeNuxtHooks>
    setup?: Plugin<Injections>
    env?: PluginEnvContext
    /**
     * Execute plugin in parallel with other parallel plugins.
     * @default false
     */
    parallel?: boolean
    /**
     * @internal
     */
    _name?: string
  }
  function defineNuxtPlugin<T extends Record<string, unknown>>(
    plugin: Plugin<T> | ObjectPlugin<T>
  ): Plugin<T> & ObjectPlugin<T>
  function useRuntimeConfig(_event?: H3Event<EventHandlerRequest>): RuntimeConfig
}
