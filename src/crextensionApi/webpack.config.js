const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'crextensionApi')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const { isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')
const VanillaJavaScript = webpackRequire('VanillaJavaScript')

module.exports = function (env) {
  const config = {
    entry: {
      crextensionApi: [
        path.join(__dirname, 'src')
      ]
    },
    externals: {
      'electron': 'commonjs electron'
    },
    output: {
      path: OUT_DIR,
      filename: 'crextensionApi.js'
    },
    plugins: [
      // Clean out our bin dir
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: isVerboseLog,
        dry: false
      }),

      // Copy our static assets
      new CopyWebpackPlugin([
        { from: path.join(__dirname, '../../package.json'), to: 'package.json', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      })
    ].filter((p) => !!p),
    resolve: {
      alias: {
        Core: path.resolve(path.join(__dirname, 'src/Core')),
        Runtime: path.resolve(path.join(__dirname, 'src/Runtime')),
        Storage: path.resolve(path.join(__dirname, 'src/Storage')),
        Tabs: path.resolve(path.join(__dirname, 'src/Tabs')),
        WebRequest: path.resolve(path.join(__dirname, 'src/WebRequest')),
        electronCrx: path.resolve(path.join(__dirname, 'src/electronCrx'))
      }
    }
  }

  VanillaJavaScript(__dirname, false, config)
  DevTools('WB CRExtension API', env, config)

  return config
}
