const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/mailboxes')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const webpack = devRequire('webpack')
const MinifyPlugin = devRequire('babel-minify-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const WebpackNotifierPlugin = devRequire('webpack-notifier')
const WebpackOnBuildPlugin = devRequire('on-build-webpack')

module.exports = function (env) {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    target: 'electron-renderer',
    devtool: isProduction ? undefined : (process.env.WEBPACK_DEVTOOL || 'source-map'),
    stats: process.env.VERBOSE_LOG === 'true' ? undefined : 'errors-only',
    node: {
      __dirname: false,
      __filename: false
    },
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
      !isProduction ? undefined : new webpack.DefinePlugin({
        __DEV__: false,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),

      // Clean out our bin dir
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: process.env.VERBOSE_LOG === 'true',
        dry: false
      }),

      // Copy our static assets
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'src/mailboxes.html'), to: 'mailboxes.html', force: true },
        { from: path.join(__dirname, 'src/offline.html'), to: 'offline.html', force: true },
        { from: path.join(__dirname, 'src/notification_linux.html'), to: 'notification_linux.html', force: true },
        { from: path.join(__dirname, '../../../package.json'), to: 'package.json', force: true },
        { from: path.join(__dirname, '../../shared/credentials.js'), to: 'credentials.js', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),

      // Minify & optimization
      new webpack.optimize.ModuleConcatenationPlugin(),
      isProduction ? new MinifyPlugin({ simplify: false }, { sourceMap: false, comments: false }) : undefined,

      // Dev tools
      process.env.NOTIFICATIONS === 'true' ? new WebpackNotifierPlugin({ title: 'WB Mailboxes', alwaysNotify: true }) : undefined,
      new WebpackOnBuildPlugin((stats) => { console.log('WB Mailboxes') })
    ].filter((p) => !!p),
    resolve: {
      extensions: ['.js', '.jsx', '.less', '.css'],
      alias: {
        shared: path.resolve(path.join(__dirname, '../../shared')),
        sharedui: path.resolve(path.join(__dirname, '../sharedui')),
        R: path.resolve(path.join(__dirname, 'src')),
        Components: path.resolve(path.join(__dirname, 'src/Components')),
        Notifications: path.resolve(path.join(__dirname, 'src/Notifications')),
        Scenes: path.resolve(path.join(__dirname, 'src/Scenes')),
        Server: path.resolve(path.join(__dirname, 'src/Server')),
        stores: path.resolve(path.join(__dirname, 'src/stores')),
        Debug: path.resolve(path.join(__dirname, 'src/Debug')),
        Runtime: path.resolve(path.join(__dirname, 'src/Runtime')),
        'package.json': path.resolve(ROOT_DIR, 'package.json')
      },
      modules: [
        'node_modules',
        path.join(__dirname, 'node_modules'),
        __dirname,
        path.resolve(path.join(__dirname, 'src'))
      ]
    },
    module: {
      rules: [
        {
          test: /(\.jsx|\.js)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: [
                  [
                    'env', {
                      targets: { chrome: process.env.CHROME_TARGET },
                      modules: false,
                      loose: true
                    }
                  ],
                  'react',
                  'stage-0'
                ],
                plugins: ['transform-class-properties']
              }
            }
          ],
          exclude: /node_modules\/(?!(alt)\/).*/, // use (alt|lib2|lib3) for more libs
          include: [
            __dirname,
            path.resolve(path.join(__dirname, '../../shared')),
            path.resolve(path.join(__dirname, '../sharedui'))
          ]
        },
        {
          test: /(\.less|\.css)$/,
          use: [ 'style-loader', 'css-loader', 'less-loader' ]
        }
      ]
    }
  }
}
