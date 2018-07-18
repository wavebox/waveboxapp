const fs = require('fs')
const path = require('path')

module.exports = function (nodeModulesPath, rootDir) {
  const proPaths = [
    path.join(nodeModulesPath, '@fortawesome/pro-light-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-regular-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-solid-svg-icons')
  ]
  const hasPro = !!proPaths.find((p) => fs.existsSync(p))

  return {
    'wbfa/FARegistry': hasPro
      ? path.join(rootDir, 'src/scenes/wbfa/FARegistry.pro.js')
      : path.join(rootDir, 'src/scenes/wbfa/FARegistry.free.js'),
    'wbfa': path.join(rootDir, 'src/scenes/wbfa')
  }
}
