class Config {
  static get isProduction () { return process.env.NODE_ENV === 'production' }
  static get isVerboseLog () { return process.env.VERBOSE_LOG === 'true' }
  static get isNotifications () { return process.env.NOTIFICATIONS === 'true' }
}

module.exports = Config
