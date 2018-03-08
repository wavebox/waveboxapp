const { ROOT_DIR, PKG } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')
const path = require('path')
const fs = require('fs')

// Check if we are up to date
const versionPath = path.join(ROOT_DIR, 'node_modules/electron/dist/wb_version')
let wbVersion
try {
  wbVersion = fs.readFileSync(versionPath, 'utf8').trim()
} catch (ex) {}

if (wbVersion !== PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR) {
  const cmds = [
    {
      cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
      args: ['run', 'cache-clean'],
      opts: {
        stdio: 'inherit',
        cwd: path.join(ROOT_DIR, 'node_modules/electron')
      },
      prelog: `${Colors.inverse('cache-clean')}`
    },
    {
      cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
      args: ['run', 'postinstall'],
      opts: {
        stdio: 'inherit',
        cwd: path.join(ROOT_DIR, 'node_modules/electron'),
        env: Object.assign({}, process.env, PKG.electronInstallEnv)
      },
      prelog: `${Colors.inverse('postinstall')}`
    }
  ]

  sequencePromiseSpawn(cmds)
    .then(() => {
      try {
        fs.writeFileSync(versionPath, PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR)
      } catch (ex) { }
    })
    .catch((e) => process.exit(-1))
}
