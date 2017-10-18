const { PACKAGE_DIRS, BIN_DIR } = require('./constants')
const path = require('path')
const Colors = require('colors/safe')
const { sequenceFsRemove } = require('./Tools')

const packageCmds = PACKAGE_DIRS.map((packageDir) => {
  const dir = path.join(packageDir, 'node_modules')
  return { dir: dir, prelog: `${Colors.inverse('Remove:')} ${dir}`, ignoreErrors: true }
})
const binCmds = [BIN_DIR].map((dir) => {
  return { dir: dir, prelog: `${Colors.inverse('Remove:')} ${dir}`, ignoreErrors: true }
})
const cmds = [].concat(binCmds, packageCmds)

sequenceFsRemove(cmds).catch(() => process.exit(-1))
