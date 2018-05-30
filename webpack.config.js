const fs = require('fs')
const argv = require('yargs').argv
const gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

module.exports = function (env = {}) {
  // Config
  process.env.CHROME_TARGET = 61
  process.env.NODE_TARGET = '8.9.3'

  const mode = new Set([
    'production',
    'development'
  ]).has(argv.mode) ? argv.mode : 'development'

  // Production
  if (mode === 'production') {
    console.log('[PRODUCTION BUILD]')
    process.env.NODE_ENV = 'production'
  } else {
    console.log('[DEVELOPMENT BUILD]')
  }

  // Cheap / expensive source maps
  if (mode === 'development') {
    if (env.fast) {
      console.log('[CHEAP SOURCEMAPS]')
      process.env.WEBPACK_DEVTOOL = 'cheap-source-map'
    } else {
      console.log('[FULL SOURCEMAPS]')
      process.env.WEBPACK_DEVTOOL = 'source-map'
    }
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

  // WARN: only import the tasks AFTER the process.env has been
  // updated. Some of these tasks eval process.env early
  const TASKS = {
    assets: require('./assets/webpack.config.js'),
    app: require('./src/app/webpack.config.js'),
    keychain: require('./src/scenes/keychain/webpack.config.js'),
    traypopout: require('./src/scenes/traypopout/webpack.config.js'),
    content: require('./src/scenes/content/webpack.config.js'),
    mailboxes: require('./src/scenes/mailboxes/webpack.config.js'),
    print: require('./src/scenes/print/webpack.config.js'),
    monitor: require('./src/scenes/monitor/webpack.config.js'),
    guest: require('./src/guest/webpack.config.js'),
    guestApi: require('./src/guestApi/webpack.config.js'),
    crextensionApi: require('./src/crextensionApi/webpack.config.js')
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
