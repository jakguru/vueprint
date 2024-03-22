import pkg from '../package.json' assert { type: 'json' }
import { fileURLToPath } from 'url'
import { join } from 'path'
import fs from 'fs-extra'

const DIRNAME = fileURLToPath(new URL('.', import.meta.url))
const BASEDIR = join(DIRNAME, '..')

const walkAndFixRelativeToDist = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(walkAndFixRelativeToDist)
  }
  for (const key in obj) {
    const fixedKey = key.replace(/(\/|\\)?dist(\/|\\)/g, '$1')
    if (fixedKey !== key) {
      obj[fixedKey] = obj[key]
      delete obj[key]
    }
    if ('string' === typeof obj[fixedKey]) {
      obj[fixedKey] = obj[fixedKey].replace(/(\/|\\)?dist(\/|\\)/g, '$1')
    } else {
      obj[fixedKey] = walkAndFixRelativeToDist(obj[fixedKey])
    }
  }
  return obj
}

const run = async () => {
  const fixed = walkAndFixRelativeToDist(pkg)
  delete fixed.files
  delete fixed.scripts
  delete fixed.eslintConfig
  delete fixed.eslintIgnore
  delete fixed.prettier
  await fs.writeJSON(join(BASEDIR, 'dist/package.json'), fixed, { spaces: 2 })
  await fs.copyFile(join(BASEDIR, 'README.md'), join(BASEDIR, 'dist/README.md'))
  await fs.copyFile(join(BASEDIR, 'LICENSE.md'), join(BASEDIR, 'dist/LICENSE.md'))
  await fs.unlink(join(BASEDIR, 'dist/style.js'))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
