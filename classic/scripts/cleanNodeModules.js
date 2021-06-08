const { PACKAGE_DIRS } = require('./constants')
const path = require('path')
const Colors = require('colors/safe')
const { sequenceFsRemove } = require('./Tools')

const cmds = PACKAGE_DIRS.map((packageDir) => {
  const dir = path.join(packageDir, 'node_modules')
  return { dir: dir, prelog: `${Colors.inverse('Remove:')} ${dir}`, ignoreErrors: true }
})

sequenceFsRemove(cmds).catch(() => process.exit(-1))
