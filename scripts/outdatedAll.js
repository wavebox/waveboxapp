const { PACKAGE_DIRS } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')

const cmds = PACKAGE_DIRS.map((dir) => {
  return {
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: [
      'outdated',
      '--save', '--save-optional' // Makes sure we cover optional deps too
    ],
    opts: { stdio: 'inherit', cwd: dir },
    prelog: `${Colors.inverse('npm outdated:')} ${dir}`,
    ignoreErrors: true
  }
})

sequencePromiseSpawn(cmds).catch((e) => process.exit(-1))
