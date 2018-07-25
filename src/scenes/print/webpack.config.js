const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/print')
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
      print: [
        path.join(__dirname, 'src/')
      ],
      'worker': [
        path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.entry')
      ]
    },
    output: {
      path: OUT_DIR,
      filename: '[name].bundle.js'
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
        { from: path.join(__dirname, 'src/index.html'), to: 'index.html', force: true },
        { from: path.join(__dirname, '../../../package.json'), to: 'package.json', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      })
    ].filter((p) => !!p)
  }

  ElectronRenderer(__dirname, config)
  DevTools('WB Print', env, config)

  return config
}
