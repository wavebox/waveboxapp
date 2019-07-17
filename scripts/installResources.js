if (process.env.TRAVIS === 'true') {
  process.exit(0)
}

const { ROOT_DIR, PKG } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')
const path = require('path')
const fs = require('fs-extra')
const download = require('download')

const downloadPak = function (packageName, version) {
  const outDirectory = path.join(ROOT_DIR, 'resources/pack/')
  const pakVersionPath = path.join(outDirectory, `${packageName}.version`)
  let installedVersion

  try {
    installedVersion = fs.readFileSync(pakVersionPath, 'utf8')
  } catch (ex) { }
  if (installedVersion === version) { return Promise.resolve() }

  let apiKey
  try {
    apiKey = require(path.join(__dirname, '../src/shared/credentials.js')).API_KEY
  } catch (ex) {}

  const downloadUrl = `https://wavebox.io/resources/packages/${packageName}/${version}/${packageName}.zip?apiKey=${apiKey}`
  const zipPath = path.join(outDirectory, `${packageName}.zip`)

  return Promise.resolve()
    .then(() => download(downloadUrl, outDirectory, {
      filename: `${packageName}.pak`,
      decompress: true
    }))
    .catch((ex) => {
      return Promise.reject(new Error(`${packageName} fetch error ${ex.statusCode}. ${ex.headers['x-reason']}`))
    })
    .then(() => {
      fs.removeSync(zipPath)
      fs.writeFileSync(pakVersionPath, version)
    })
}

Promise.resolve()
  .then(() => { // Resources
    return Object.keys(PKG.resources).reduce((acc, k) => {
      return acc.then(() => downloadPak(k, PKG.resources[k]))
    }, Promise.resolve())
  })
  .then(() => { // Electron
    // Check if we are up to date
    const versionPath = path.join(ROOT_DIR, 'node_modules/electron/dist/wb_version')
    const cachePath = path.join(ROOT_DIR, '.caches/electron')

    let wbVersion
    try {
      wbVersion = fs.readFileSync(versionPath, 'utf8').trim()
    } catch (ex) {}

    if (wbVersion === PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR) {
      return Promise.resolve()
    }

    return Promise.resolve()
      .then(() => fs.remove(path.join(ROOT_DIR, 'node_modules/electron/dist')))
      .then(() => fs.remove(cachePath))
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
                electron_config_cache: cachePath
              }
            },
            prelog: `${Colors.inverse('postinstall')}`
          }
        ])
      })
      .then(() => fs.remove(cachePath))
      .then(() => {
        try {
          fs.writeFileSync(versionPath, PKG.electronInstallEnv.ELECTRON_CUSTOM_DIR)
        } catch (ex) {
          console.log(ex)
          process.exit(-1)
        }
      })
  })
  .catch((ex) => {
    console.log(ex)
    process.exit(-1)
  })
