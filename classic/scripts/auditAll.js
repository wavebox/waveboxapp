const { PACKAGE_DIRS } = require('./constants')
const { promiseSpawn } = require('./Tools')
const Colors = require('colors/safe')

Promise.resolve()
  .then(() => {
    return PACKAGE_DIRS.reduce((acc, dir) => {
      return acc
        .then(() => {
          console.log(`${Colors.inverse('npm audit:')} ${dir}`)
          return promiseSpawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['audit'],
            { stdio: 'inherit', cwd: dir }
          ).catch(() => Promise.resolve()) // Audit returns an error code for failed audits
        })
    }, Promise.resolve())
  })
  .catch((e) => {
    process.exit(-1)
  })
