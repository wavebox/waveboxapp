const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const { isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')
const VanillaJavaScript = webpackRequire('VanillaJavaScript')

module.exports = function (env) {
  const config = {
    entry: path.join(__dirname, 'src/index.js'),
    output: {
      path: BIN_DIR,
      filename: 'guest/guest.js'
    },
    externals: {
      'electron': 'commonjs electron',
      'fs': 'throw new Error("fs is not available")' // require('fs') is in hunspell-asm but it handles the failure gracefully :)
    },
    plugins: [
      new CleanWebpackPlugin(['guest'], {
        root: BIN_DIR,
        verbose: isVerboseLog,
        dry: false
      })
    ].filter((p) => !!p),
    resolve: {
      alias: {
        Adaptors: path.resolve(path.join(__dirname, 'src/Adaptors')),
        Browser: path.resolve(path.join(__dirname, 'src/Browser')),
        DispatchManager: path.resolve(path.join(__dirname, 'src/DispatchManager')),
        Extensions: path.resolve(path.join(__dirname, 'src/Extensions')),
        elconsole: path.resolve(path.join(__dirname, 'src/elconsole')),
        LiveConfig: path.resolve(path.join(__dirname, 'src/LiveConfig')),
        stores: path.resolve(path.join(__dirname, 'src/stores'))
      }
    }
  }

  VanillaJavaScript(__dirname, false, config)
  DevTools('WB Guest', env, config)
  return config
}
