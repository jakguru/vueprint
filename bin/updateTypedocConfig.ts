import pkg from '../package.json' assert { type: 'json' }
import { fileURLToPath } from 'url'
import { join } from 'path'
import fs from 'fs-extra'

const DIRNAME = fileURLToPath(new URL('.', import.meta.url))
const BASEDIR = join(DIRNAME, '..')

const base = {
  entryPoints: [],
  entryPointStrategy: 'resolve',
  tsconfig: './tsconfig.typedoc.json',
  exclude: ['node_modules/**/*', 'dist/**/*', 'docs/**/*', 'templates/**/*', 'playgrounds/**/*'],
  compilerOptions: {
    skipLibCheck: true,
  },
  out: 'docs/api',
  json: 'docs/api/reflections.json',
  plugin: [
    'typedoc-plugin-vue',
    'typedoc-plugin-mdn-links',
    // 'typedoc-plugin-missing-exports',
    'typedoc-plugin-markdown',
  ],
  sort: ['instance-first', 'required-first', 'kind', 'visibility', 'alphabetical'],
  readme: 'none',
  excludeNotDocumented: false,
  excludeExternals: false,
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: false,
  excludeReferences: false,
  githubPages: false,
  theme: 'default',
  hideGenerator: true,
  includeVersion: false,
  searchInComments: true,
  sourceLinkTemplate: 'https://github.com/jakguru/vueprint/blob/{gitRevision}/{path}#L{line}',
  validation: {
    notExported: true,
    invalidLink: true,
    notDocumented: true,
  },
  externalSymbolLinkMappings: {
    'global': {
      Boolean: 'https://developer.mozilla.org/en-US/docs/Glossary/Boolean/JavaScript',
      String: 'https://developer.mozilla.org/en-US/docs/Glossary/String',
      Void: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void',
      Number: 'https://developer.mozilla.org/en-US/docs/Glossary/Number',
      Set: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
      Error:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
      ServiceWorkerGlobalScope:
        'https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope',
    },
    'typescript': {
      Boolean: 'https://developer.mozilla.org/en-US/docs/Glossary/Boolean/JavaScript',
      String: 'https://developer.mozilla.org/en-US/docs/Glossary/String',
      Void: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void',
      Number: 'https://developer.mozilla.org/en-US/docs/Glossary/Number',
      Set: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
      Error:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    },
    'events': {
      'EventEmitter': 'https://nodejs.org/docs/latest-v18.x/api/events.html#class-eventemitter',
      'EventEmitter.on':
        'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteroneventname-listener',
      'EventEmitter.once':
        'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteronceeventname-listener',
      'EventEmitter.off':
        'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteroffeventname-listener',
      'EventEmitter.removeAllListeners':
        'https://nodejs.org/docs/latest-v18.x/api/events.html#emitterremovealllistenerseventname',
    },
    'EventEmitter': {
      on: 'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteroneventname-listener',
      once: 'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteronceeventname-listener',
      off: 'https://nodejs.org/docs/latest-v18.x/api/events.html#emitteroffeventname-listener',
      removeAllListeners:
        'https://nodejs.org/docs/latest-v18.x/api/events.html#emitterremovealllistenerseventname',
    },
    '@types/luxon': {
      DateTime: 'https://moment.github.io/luxon/api-docs/index.html#datetime',
    },
    'luxon': {
      DateTime: 'https://moment.github.io/luxon/api-docs/index.html#datetime',
    },
    'axios': {
      InternalAxiosRequestConfig: 'https://github.com/axios/axios/blob/main/index.d.ts',
      Axios: 'https://github.com/axios/axios/blob/main/index.d.ts#L46',
      AxiosResponse: 'https://github.com/axios/axios/blob/main/index.d.ts#L246',
      AxiosRequestConfig: 'https://github.com/axios/axios/blob/main/index.d.ts#L183',
    },
    'knex': {
      'QueryBuilder': 'https://knexjs.org/guide/query-builder.html',
      'Knex.QueryBuilder': 'https://knexjs.org/guide/query-builder.html',
    },
    'Knex': {
      'QueryBuilder': 'https://knexjs.org/guide/query-builder.html',
      'Knex.QueryBuilder': 'https://knexjs.org/guide/query-builder.html',
    },
    'vuetify': {
      VuetifyOptions: 'https://vuetifyjs.com/en/features/global-configuration/#setup',
      ThemeDefinition: 'https://vuetifyjs.com/en/features/theme/#api',
    },
    'vue': {
      Plugin:
        'https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts#L168',
    },
    '@vue/runtime-core': {
      Plugin:
        'https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts#L168',
    },
    '@vue/reactivity': {
      Ref: 'https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts#L33',
      ComputedRef:
        'https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts#L11',
    },
  },
  entryDocument: 'index.md',
  hideBreadcrumbs: false,
  hideInPageTOC: true,
  namedAnchors: true,
  objectLiteralTypeDeclarationStyle: 'list',
  allReflectionsHaveOwnDocument: false,
}

const run = async () => {
  const exportList =
    pkg.exports || ({} as Record<string, { import: string; require: string; types: string }>)
  const possiblyDocumentableFiles = Object.keys(exportList)
    .filter((file) => {
      // Exclude non typescript files
      if (file.endsWith('.json') || file.endsWith('.css') || file.endsWith('.scss')) {
        return false
      }
      return true
    })
    .map((file) => {
      if ('.' === file) {
        return 'src/index.ts'
      } else {
        return `${file.replace(/\.\//gm, 'src/')}.ts`
      }
    })
  const filesWithExportsOrUndefined = await Promise.all(
    possiblyDocumentableFiles.map(async (file) => {
      const filePath = join(BASEDIR, file)
      const exists = await fs.pathExists(filePath)
      if (!exists) {
        return
      }
      const contents = await fs.readFile(filePath, 'utf-8')
      if (!contents.includes('export')) {
        return
      }
      return file
    })
  )
  const filesWithExports = filesWithExportsOrUndefined.filter(
    (file) => file !== undefined
  ) as string[]
  const updated = { ...base, entryPoints: filesWithExports }
  const configPath = join(BASEDIR, 'typedoc.json')
  await fs.writeJSON(configPath, updated, { spaces: 2 })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
