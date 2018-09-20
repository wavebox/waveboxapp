const path = require('path')
const { isProduction } = require('./Config')
const ROOT_DIR = path.resolve(path.join(__dirname, '../'))
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))
const webpack = devRequire('webpack')
const TerserPlugin = require('terser-webpack-plugin')

/**
* @param packagePath: the root path of the package
* @param isNodeJS: true if this is building for nodeJS
* @param config: the current webpack config
* @return the updated webpack config
*/
module.exports = function (packagePath, isNodeJS, config) {
  config.node = config.node || {}
  config.node.__dirname = false
  config.node.__filename = false

  config.optimization = config.optimization || {}
  config.optimization.minimizer = [new TerserPlugin()]
  config.optimization.minimize = isProduction

  // Plugins
  config.plugins = config.plugins || []

  config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
  if (isProduction) {
    config.plugins.push(new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production')
    }))
  }

  // Resolve
  config.resolve = config.resolve || {}

  // Module:Resolve
  config.resolve.extensions = (config.resolve.extensions || []).concat([
    '.js',
    '.jsx',
    '.json'
  ])

  // Module:Alias
  config.resolve.alias = config.resolve.alias || {}
  config.resolve.alias['shared'] = path.resolve(path.join(ROOT_DIR, 'src/shared'))
  config.resolve.alias['R'] = path.resolve(path.join(packagePath, 'src'))
  config.resolve.alias['package.json'] = path.resolve(path.join(ROOT_DIR, 'package.json'))

  // Module:Modules
  config.resolve.modules = (config.resolve.modules || []).concat([
    'node_modules',
    path.join(packagePath, 'node_modules'),
    packagePath,
    path.resolve(path.join(packagePath, 'src'))
  ])

  // Module
  config.module = config.module || {}
  config.module.rules = (config.module.rules || []).concat([
    {
      test: /(\.jsx|\.js)$/,
      loader: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env', {
                  targets: isNodeJS ? {
                    node: process.env.NODE_TARGET
                  } : {
                    chrome: process.env.CHROME_TARGET
                  },
                  modules: false,
                  loose: true
                }
              ],
              '@babel/preset-react'
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      ],
      exclude: (modulePath) => {
        const match = ([
          { patt: `${path.sep}node_modules${path.sep}alt${path.sep}`, val: false },
          { patt: `${path.sep}node_modules${path.sep}`, val: true }
        ]).find((r) => modulePath.indexOf(r.patt) !== -1)
        return match ? match.val : false
      },
      include: [
        packagePath,
        path.resolve(path.join(ROOT_DIR, 'src/shared'))
      ]
    }
  ])

  return config
}
