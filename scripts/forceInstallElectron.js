const { ROOT_DIR } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')
const path = require('path')
let localEnv
try {
  localEnv = require('./env.local')
} catch (ex) {
  localEnv = {}
}

const cmds = [
  {
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['install'],
    opts: { stdio: 'inherit', cwd: ROOT_DIR },
    prelog: `${Colors.inverse('npm install:')} ${ROOT_DIR}`
  },
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
      env: Object.assign({}, process.env, localEnv.forceInstallElectron)
    },
    prelog: `${Colors.inverse('postinstall')}`
  }
]

sequencePromiseSpawn(cmds).catch((e) => process.exit(-1))
