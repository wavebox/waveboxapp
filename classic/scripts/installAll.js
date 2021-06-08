// There's a common use-case where we are run before npm install which means
// we don't have all our dev tooling available. In this case patch in a npm
// install first to ensure we have what we need
;(function () {
  const { spawnSync } = require('child_process')
  const path = require('path')
  const fs = require('fs')
  const resolvable = [
    path.join(__dirname, '../node_modules/fs-extra'),
    path.join(__dirname, '../node_modules/colors')
  ]
  const unresolved = resolvable.find((p) => !fs.existsSync(p))
  if (unresolved) {
    // We probably need to run npm install
    console.log('>> Auto-running npm install for support libraries...')
    spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['install'],
      {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    )
    console.log('>> ...support libraries installed. Continuing with install:all')
  }
})()

// Run out full install
const { PACKAGE_DIRS } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')

const cmds = PACKAGE_DIRS.map((dir) => {
  return {
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['install'],
    opts: { stdio: 'inherit', cwd: dir },
    prelog: `${Colors.inverse('npm install:')} ${dir}`
  }
})

sequencePromiseSpawn(cmds).catch((e) => process.exit(-1))
