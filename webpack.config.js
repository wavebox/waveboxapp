const fs = require('fs')
const gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

const TASKS = {
  assets: require('./assets/webpack.config.js'),
  app: require('./src/app/webpack.config.js'),
  keychain: require('./src/scenes/keychain/webpack.config.js'),
  content: require('./src/scenes/content/webpack.config.js'),
  mailboxes: require('./src/scenes/mailboxes/webpack.config.js'),
  print: require('./src/scenes/print/webpack.config.js'),
  monitor: require('./src/scenes/monitor/webpack.config.js'),
  guest: require('./src/guest/webpack.config.js'),
  guestApi: require('./src/guestApi/webpack.config.js'),
  crextensionApi: require('./src/crextensionApi/webpack.config.js')
}

module.exports = function (env = {}) {
  // Config
  process.env.CHROME_TARGET = 59
  process.env.NODE_TARGET = '8.2.1'

  // Production
  if (env.p || env.production) {
    console.log('[PRODUCTION BUILD]')
    process.env.NODE_ENV = 'production'
  } else {
    console.log('[DEVELOPMENT BUILD]')
  }

  // Cheap / expensive source maps
  if (env.fast) {
    console.log('[CHEAP SOURCEMAPS]')
    process.env.WEBPACK_DEVTOOL = 'eval-cheap-module-source-map'
  } else {
    console.log('[FULL SOURCEMAPS]')
  }

  if (env.disableNotify) {
    console.log('[NOTIFICATIONS DISABLED]')
    process.env.NOTIFICATIONS = 'false'
  } else {
    console.log('[NOTIFICATIONS_ENABLED]')
    process.env.NOTIFICATIONS = 'true'
  }

  if (env.verbose) {
    console.log('[VERBOSE LOG]')
    process.env.VERBOSE_LOG = 'true'
  } else {
    console.log('[QUIET LOG]')
    process.env.VERBOSE_LOG = 'false'
  }

  // Tasks
  const taskInput = env.task ? env.task : ['all']
  const taskNames = Array.isArray(taskInput) ? taskInput : [taskInput]

  // Prep tests
  if (taskNames.find((n) => n === 'all')) {
    return Object.keys(TASKS).map((k) => TASKS[k](env))
  } else {
    return taskNames.map((n) => TASKS[n](env))
  }
}
