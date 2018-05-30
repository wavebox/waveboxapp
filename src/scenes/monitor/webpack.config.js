const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/monitor')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const { isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')
const ElectronRenderer = webpackRequire('ElectronRenderer')

module.exports = function (env) {
  const config = {
    entry: {
      monitor: [
        path.join(__dirname, 'src')
      ]
    },
    output: {
      path: OUT_DIR,
      filename: 'monitor.js'
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
        { from: path.join(__dirname, 'src/monitor.html'), to: 'monitor.html', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      })
    ].filter((p) => !!p),
    resolve: {
      alias: {
        stores: path.resolve(path.join(__dirname, 'src/stores')),
        Scenes: path.resolve(path.join(__dirname, 'src/Scenes'))
      }
    }
  }

  ElectronRenderer(__dirname, config)
  DevTools('WB Monitor', env, config)

  return config
}
