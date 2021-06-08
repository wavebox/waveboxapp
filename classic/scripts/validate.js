const Colors = require('colors/safe')
const { ROOT_DIR } = require('./constants')
const path = require('path')
const pkg = require(path.join(ROOT_DIR, 'package.json'))
const pkgLock = require(path.join(ROOT_DIR, 'package-lock.json'))

const failures = []

// Tests
if (pkg.name !== 'wavebox') {
  failures.push(`Package name is not wavebox but instead "${pkg.name}"`)
}
if (pkgLock.name !== 'wavebox') {
  failures.push(`Package-lock name is not wavebox but instead "${pkgLock.name}"`)
}
if (pkgLock.version !== pkg.version) {
  failures.push(`Version in package-lock.json does not match that in package.json "${pkg.version} !== ${pkgLock.version}"`)
}

if (failures.length) {
  console.log(`${Colors.bgRed.white(`${failures.length} validation failures`)}`)
  const log = failures.map((f) => `${Colors.red('>>')} ${f}`).join('\n')
  console.log(log)
  process.exit(-1)
} else {
  console.log(`${Colors.bgGreen.white('0 validation failures')}`)
  process.exit(0)
}
