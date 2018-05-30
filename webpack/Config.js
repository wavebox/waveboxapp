const isProduction = process.env.NODE_ENV === 'production'
const isVerboseLog = process.env.VERBOSE_LOG === 'true'
const isNotifications = process.env.NOTIFICATIONS === 'true'

module.exports = {
  isProduction: isProduction,
  isVerboseLog: isVerboseLog,
  isNotifications: isNotifications
}
