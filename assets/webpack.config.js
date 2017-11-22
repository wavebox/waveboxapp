const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const WebpackNotifierPlugin = devRequire('webpack-notifier')

module.exports = function (env) {
  return {
    entry: path.join(__dirname, '__.js'),
    stats: process.env.VERBOSE_LOG === 'true' ? undefined : 'errors-only',
    output: {
      path: BIN_DIR,
      filename: '__.js'
    },
    plugins: [
      new CleanWebpackPlugin(['fonts', 'icons', 'images'], {
        root: BIN_DIR,
        verbose: process.env.VERBOSE_LOG === 'true',
        dry: false
      }),
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'audio'), to: 'audio', force: true },
        { from: path.join(__dirname, 'fonts'), to: 'fonts', force: true },
        { from: path.join(__dirname, 'icons'), to: 'icons', force: true },
        { from: path.join(__dirname, 'images'), to: 'images', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),
      process.env.NOTIFICATIONS === 'true' ? new WebpackNotifierPlugin({ title: 'WB Content', alwaysNotify: true }) : undefined
    ]
  }
}
