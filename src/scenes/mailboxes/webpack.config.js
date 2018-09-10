const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/mailboxes')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const FontAwesomeAlias = require(path.join(ROOT_DIR, 'webpack/FontAwesomeAlias'))
const { isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')
const ElectronRenderer = webpackRequire('ElectronRenderer')

module.exports = function (env) {
  const config = {
    entry: {
      mailboxes: [
        path.join(__dirname, 'src')
      ]
    },
    output: {
      path: OUT_DIR,
      filename: 'mailboxes.js'
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
        { from: path.join(__dirname, 'src/mailboxes.html'), to: 'mailboxes.html', force: true },
        { from: path.join(__dirname, 'src/offline.html'), to: 'offline.html', force: true },
        { from: path.join(__dirname, '../../../package.json'), to: 'package.json', force: true },
        { from: path.join(__dirname, '../../shared/credentials.js'), to: 'credentials.js', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      })
    ].filter((p) => !!p),
    resolve: {
      alias: Object.assign({},
        FontAwesomeAlias(path.join(__dirname, 'node_modules'), ROOT_DIR),
        {
          Components: path.resolve(path.join(__dirname, 'src/Components')),
          Notifications: path.resolve(path.join(__dirname, 'src/Notifications')),
          Scenes: path.resolve(path.join(__dirname, 'src/Scenes')),
          Server: path.resolve(path.join(__dirname, 'src/Server')),
          stores: path.resolve(path.join(__dirname, 'src/stores')),
          Debug: path.resolve(path.join(__dirname, 'src/Debug')),
          Runtime: path.resolve(path.join(__dirname, 'src/Runtime'))
        }
      )
    }
  }

  ElectronRenderer(__dirname, config)
  DevTools('WB Mailboxes', env, config)

  return config
}
