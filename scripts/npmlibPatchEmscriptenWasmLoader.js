const path = require('path')
const fs = require('fs-extra')
const Colors = require('colors/safe')

const MODULE_DIR = path.resolve('./node_modules/emscripten-wasm-loader')
const PACKAGE_PATH = path.join(MODULE_DIR, 'package.json')
const CONSTRUCT_MODULE_PATH = path.join(MODULE_DIR, 'dist/src/constructModule.js')

console.log(`${Colors.inverse('emscripten-wasm-loader')} start patch in "${MODULE_DIR}"`)
const targetPkg = fs.readJsonSync(PACKAGE_PATH)
if (targetPkg.version !== '1.0.0') {
  console.log(`  ${Colors.red('ERROR')} Version mismatch ${targetPkg.version} !== '1.0.0'`)
  process.exit(-1)
}

const constructModule = fs.readFileSync(CONSTRUCT_MODULE_PATH, 'utf8')
const constructModulePatched = constructModule
  .replace(
    `if (timeout === void 0) { timeout = 3000; }`,
    `if (timeout === void 0) { timeout = 10000; }`
  )
fs.writeFileSync(CONSTRUCT_MODULE_PATH, constructModulePatched)
console.log(`  ${Colors.bgGreen.white(`Done`)}`)
