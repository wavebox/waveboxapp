const TASKS = {
  assets: require('./assets/webpack.config.js'),
  app: require('./src/app/webpack.config.js'),
  content: require('./src/scenes/content/webpack.config.js'),
  mailboxes: require('./src/scenes/mailboxes/webpack.config.js'),
  bridge: require('./src/scenes/bridge/webpack.config.js'),
  monitor: require('./src/scenes/monitor/webpack.config.js'),
  guest: require('./src/guest/webpack.config.js'),
  guestApi: require('./src/guestApi/webpack.config.js')
}

module.exports = function (env = {}) {
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
