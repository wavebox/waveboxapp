const { PACKAGE_DIRS } = require('./constants')
const { sequencePromiseSpawn } = require('./Tools')
const Colors = require('colors/safe')

const cmds = PACKAGE_DIRS.map((dir) => {
  return {
    cmd: 'npm',
    args: ['outdated'],
    opts: { stdio: 'inherit', cwd: dir },
    prelog: `${Colors.inverse('npm outdated:')} ${dir}`,
    ignoreErrors: true
  }
})

sequencePromiseSpawn(cmds).catch((e) => process.exit(-1))
