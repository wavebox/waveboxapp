const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/content')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const webpack = devRequire('webpack')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')

module.exports = function (env) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    target: 'electron-renderer',
    devtool: isProduction ? undefined : (process.env.WEBPACK_DEVTOOL || 'source-map'),
    entry: {
      content: [
        path.join(__dirname, 'src')
      ]
    },
    output: {
      path: OUT_DIR,
      filename: 'content.js'
    },
    plugins: [
      !isProduction ? undefined : new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),

      // Clean out our bin dir
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: true,
        dry: false
      }),

      // Ignore electron modules and other modules we don't want to compile in
      new webpack.IgnorePlugin(new RegExp('^(electron)$')),

      // Copy our static assets
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'src/content.html'), to: 'content.html', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),

      // Minify in production
      isProduction ? new webpack.optimize.UglifyJsPlugin({}) : undefined
    ].filter((p) => !!p),
    resolve: {
      extensions: ['.js', '.jsx', '.less', '.css'],
      alias: {
        shared: path.resolve(path.join(__dirname, '../../shared')),
        sharedui: path.resolve(path.join(__dirname, '../sharedui')),
        R: path.resolve(path.join(__dirname, 'src')),
        stores: path.resolve(path.join(__dirname, 'src/stores')),
        Scenes: path.resolve(path.join(__dirname, 'src/Scenes'))
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
          loader: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: ['react', 'stage-0', 'es2015'],
                plugins: ['transform-class-properties']
              }
            }
          ],
          exclude: /node_modules/,
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
