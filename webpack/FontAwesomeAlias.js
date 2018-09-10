const fs = require('fs')
const path = require('path')

module.exports = function (nodeModulesPath, rootDir) {
  const proPaths = [
    path.join(nodeModulesPath, '@fortawesome/pro-light-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-regular-svg-icons'),
    path.join(nodeModulesPath, '@fortawesome/pro-solid-svg-icons')
  ]
  const hasPro = !!proPaths.find((p) => fs.existsSync(p))

  const icons = fs.readdirSync(path.join(rootDir, 'src/scenes/wbfa/generated'))
    .map((filename) => {
      if (hasPro && filename.endsWith('.pro.js')) {
        return filename.substr(0, filename.length - 7)
      } else if (!hasPro && filename.endsWith('.free.js')) {
        return filename.substr(0, filename.length - 8)
      } else {
        return undefined
      }
    })
    .filter((icon) => !!icon)
  const iconAlias = icons.reduce((acc, icon) => {
    const filename = `${icon}.${hasPro ? 'pro' : 'free'}.js`
    acc[`wbfa/${icon}`] = path.join(rootDir, 'src/scenes/wbfa/generated/', filename)
    return acc
  }, {})

  return iconAlias
}
