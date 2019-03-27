const path = require('path')
const fs = require('fs-extra')
const { SRC_DIR } = require('./constants')
const Colors = require('colors/safe')

const MODULE_DIR = path.join(SRC_DIR, 'app/node_modules/electron-fetch/')
const PACKAGE_PATH = path.join(MODULE_DIR, 'package.json')
const LIB_PATH = path.join(MODULE_DIR, 'lib/index.js')
const VALID_VERSION = '1.3.0'

console.log(`${Colors.inverse('Patch electron-fetch:')} ${MODULE_DIR}`)

if (fs.readJSONSync(PACKAGE_PATH).version !== VALID_VERSION) {
  console.log(`    ${Colors.red('FAILED:')} Version mismatch ${VALID_VERSION}`)
  process.exit(-1)
}

const src = fs.readFileSync(LIB_PATH, 'utf8')
if (src.indexOf('const req = send(options);//patch-electron-fetch=true') !== -1) {
  console.log(`    ${Colors.green('SKIP:')} Already patched`)
} else {
  const patched = src.replace('const req = send(options);', 'if (request.useElectronNet) { options.credentials = opts.credentials };const req = send(options);//patch-electron-fetch=true')
  fs.writeFileSync(LIB_PATH, patched)
  console.log(`    ${Colors.green('DONE:')} Patched`)
}
