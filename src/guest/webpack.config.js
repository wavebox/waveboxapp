const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'guest')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const WebpackNotifierPlugin = devRequire('webpack-notifier')
const WebpackOnBuildPlugin = devRequire('on-build-webpack')

module.exports = function (env) {
  return {
    entry: path.join(__dirname, '__.js'),
    stats: process.env.VERBOSE_LOG === 'true' ? undefined : 'errors-only',
    output: {
      path: OUT_DIR,
      filename: '__.js'
    },
    plugins: [
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: process.env.VERBOSE_LOG === 'true',
        dry: false
      }),
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'src'), to: 'guest', force: true },
        { from: path.join(__dirname, 'node_modules'), to: 'guest/node_modules', force: true },
        { from: path.join(__dirname, '../shared/'), to: 'shared', force: true },
        { from: path.join(ROOT_DIR, 'package.json'), to: '', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),

      process.env.NOTIFICATIONS === 'true' ? new WebpackNotifierPlugin({ title: 'WB Guest', alwaysNotify: true }) : undefined,
      new WebpackOnBuildPlugin((stats) => { console.log('WB Guest') })
    ]
  }
}
