// Don't run when using travis. We only install dev dependencies and this will fail
if (process.env.TRAVIS === 'true') {
  process.exit(0)
}

const { ROOT_DIR, PKG } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')
const path = require('path')
const fs = require('fs-extra')

// Check if we are up to date
const versionPath = path.join(ROOT_DIR, 'node_modules/electron/dist/wb_version')
let wbVersion
try {
  wbVersion = fs.readFileSync(versionPath, 'utf8').trim()
} catch (ex) {}

if (wbVersion !== PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR) {
  Promise.resolve()
    .then(() => fs.remove(path.join(ROOT_DIR, 'node_modules/electron/dist')))
    .then(() => {
      return sequencePromiseSpawn([
        {
          cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
          args: ['run', 'postinstall'],
          opts: {
            stdio: 'inherit',
            cwd: path.join(ROOT_DIR, 'node_modules/electron'),
            env: {
              ...process.env,
              ...PKG.electronInstallEnv,
              electron_config_cache: path.join(ROOT_DIR, '.caches')
            }
          },
          prelog: `${Colors.inverse('postinstall')}`
        }
      ])
    })
    .then(() => {
      try {
        fs.writeFileSync(versionPath, PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR)
      } catch (ex) {
        console.log(ex)
        process.exit(-1)
      }
    })
    .catch((ex) => {
      console.log(ex)
      process.exit(-1)
    })
}
