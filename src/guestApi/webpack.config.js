const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'guestApi')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpackRequire = (n) => require(path.join(ROOT_DIR, 'webpack', n))

const UglifyJS = devRequire('uglify-es')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const { isProduction, isVerboseLog } = webpackRequire('Config')
const DevTools = webpackRequire('DevTools')

module.exports = function (env) {
  const config = {
    entry: path.join(__dirname, '__.js'),
    output: {
      path: OUT_DIR,
      filename: '__.js'
    },
    plugins: [
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: isVerboseLog,
        dry: false
      }),
      new CopyWebpackPlugin([
        {
          from: path.join(__dirname, 'src'),
          to: '',
          force: true,
          transform: isProduction ? (content, path) => {
            const res = UglifyJS.minify(content.toString())
            if (res.error) {
              throw res.error
            } else {
              return res.code
            }
          } : undefined
        }
      ], {
        ignore: [ '.DS_Store' ]
      })
    ]
  }

  DevTools('WB Guest API', env, config)
  return config
}
