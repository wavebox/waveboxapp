const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../'))
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const WebpackNotifierPlugin = devRequire('webpack-notifier')
const ProgressBarPlugin = devRequire('progress-bar-webpack-plugin')
const NyanProgressPlugin = require('nyan-progress-webpack-plugin')
const BuildDonePlugin = require('./BuildDonePlugin')
const Colors = devRequire('colors')
const {
  isNotifications,
  isProduction,
  isVerboseLog
} = require('./Config')

const isSingleTask = function (env) {
  const taskInput = env.task ? env.task : ['all']
  const taskNames = Array.isArray(taskInput) ? taskInput : [taskInput]
  if (taskNames.length === 1 && taskNames[0] !== 'all') {
    return true
  } else {
    return false
  }
}

/**
* @param name: the task name
* @param env: the webpack env variable
* @param config: the webpack config
* @return the updated webpack config
*/
module.exports = function (name, env, config) {
  config.devtool = isProduction ? undefined : (process.env.WEBPACK_DEVTOOL || 'source-map')
  config.stats = isVerboseLog ? undefined : 'errors-only'

  // Perf
  config.performance = config.performance || {}
  config.performance.hints = false

  // Plugins
  config.plugins = config.plugins || []
  if (isNotifications) {
    config.plugins.push(new WebpackNotifierPlugin({ title: name, alwaysNotify: true }))
  }

  if (isSingleTask(env)) {
    if (env.meow) {
      config.plugins.push(new NyanProgressPlugin({
        debounceInterval: 1000
      }))
    } else {
      config.plugins.push(new ProgressBarPlugin({
        format: `${Colors.inverse(name)} [:bar] ${Colors.green(':percent')} :msg`,
        callback: () => {
          console.log(`${Colors.inverse('[Build Complete]')} ${name}`)
        }
      }))
    }
  } else {
    config.plugins.push(new BuildDonePlugin((stats) => {
      console.log(`${Colors.inverse('[Build Complete]')} ${name}`)
    }))
  }

  return config
}
