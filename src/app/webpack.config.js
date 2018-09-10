const path = require('path')
const fs = require('fs')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const webpack = devRequire('webpack')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const { isProduction, isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')
const VanillaJavaScript = webpackRequire('VanillaJavaScript')

module.exports = function (env) {
  const config = {
    entry: path.join(__dirname, 'src/index.js'),
    target: 'electron-main',
    output: {
      path: BIN_DIR,
      filename: 'app/index.js'
    },
    externals: fs.readdirSync(path.join(__dirname, 'node_modules')).reduce((acc, m) => {
      if (!m.startsWith('.')) {
        acc[m] = 'commonjs ' + m
      }
      return acc
    }, {}),
    plugins: [
      new CleanWebpackPlugin(['app'], {
        root: BIN_DIR,
        verbose: isVerboseLog,
        dry: false
      }),
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'node_modules'), to: 'app/node_modules', force: true },
        { from: path.join(__dirname, 'src/BasicHTTPAuthHandler.html'), to: 'app/BasicHTTPAuthHandler.html', force: true },
        { from: path.join(__dirname, 'src/Notifications/LinuxNotification.html'), to: 'app/LinuxNotification.html', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),

      // Minify & optimization & devtools
      isProduction ? undefined : new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    ].filter((p) => !!p),
    resolve: {
      alias: {
        AppEvents: path.resolve(path.join(__dirname, 'src/AppEvents')),
        AppUpdater: path.resolve(path.join(__dirname, 'src/AppUpdater')),
        AuthProviders: path.resolve(path.join(__dirname, 'src/AuthProviders')),
        DownloadManager: path.resolve(path.join(__dirname), 'src/DownloadManager'),
        ElectronTools: path.resolve(path.join(__dirname, 'src/ElectronTools')),
        Extensions: path.resolve(path.join(__dirname, 'src/Extensions')),
        Notifications: path.resolve(path.join(__dirname, 'src/Notifications')),
        Permissions: path.resolve(path.join(__dirname, 'src/Permissions')),
        Runtime: path.resolve(path.join(__dirname, 'src/Runtime')),
        SessionManager: path.resolve(path.join(__dirname, 'src/SessionManager')),
        Storage: path.resolve(path.join(__dirname, 'src/Storage')),
        stores: path.resolve(path.join(__dirname, 'src/stores')),
        Tray: path.resolve(path.join(__dirname, 'src/Tray')),
        WebContentsManager: path.resolve(path.join(__dirname, 'src/WebContentsManager')),
        Windows: path.resolve(path.join(__dirname, 'src/Windows'))
      }
    }
  }

  VanillaJavaScript(__dirname, true, config)
  DevTools('WB App', env, config)
  return config
}
