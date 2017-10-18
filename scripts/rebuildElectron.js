const rebuild = require('electron-rebuild').default
const { REBUILD_PACKAGE_DIRS, PKG } = require('./constants')
const Colors = require('colors/safe')

Promise.resolve()
  .then(() => {
    return REBUILD_PACKAGE_DIRS.reduce((acc, dir) => {
      return acc
        .then(() => {
          console.log(`${Colors.inverse('rebuild:')} ${dir}`)
          return Promise.resolve()
        })
        .then(() => {
          return rebuild({
            buildPath: dir,
            electronVersion: PKG.dependencies.electron,
            force: true,
            types: ['prod', 'optional']
          })
        })
    }, Promise.resolve())
  })
  .catch((err) => {
    console.error(err)
    process.exit(-1)
  })
