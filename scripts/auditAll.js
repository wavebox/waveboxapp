const { PACKAGE_DIRS } = require('./constants')
const { promiseSpawn } = require('./Tools')
const Colors = require('colors/safe')
const fs = require('fs-extra')
const path = require('path')

Promise.resolve()
  .then(() => {
    return PACKAGE_DIRS.reduce((acc, dir) => {
      return acc
        .then(() => fs.move(path.join(dir, '.npmrc'), path.join(dir, '.npmrc.bak')))
        .then(() => {
          console.log(`${Colors.inverse('npm install:')} ${dir}`)
          return promiseSpawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['install', '--package-lock-only'],
            { cwd: dir }
          )
        })
        .then(() => {
          console.log(`${Colors.inverse('npm audit:')} ${dir}`)
          return promiseSpawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['audit'],
            { stdio: 'inherit', cwd: dir }
          ).catch(() => Promise.resolve()) // Audit returns an error code for failed audits
        })
        .then(() => fs.move(path.join(dir, '.npmrc.bak'), path.join(dir, '.npmrc')))
        .then(() => fs.remove(path.join(dir, 'package-lock.json')))
    }, Promise.resolve())
  })
  .catch((e) => {
    console.log(Colors.bgRed.white('audit:all failed and probably left your install in a dirty state. You should run git status to fix'))
    process.exit(-1)
  })
