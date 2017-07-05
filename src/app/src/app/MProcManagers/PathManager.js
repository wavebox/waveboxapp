const pkg = require('../../package.json')
const path = require('path')
const AppDirectory = require('appdirectory')
const appDirectory = new AppDirectory({
  appName: pkg.name,
  useRoaming: true
})
const LanguageSettings = require('../../shared/Models/Settings/LanguageSettings')

module.exports = {
  // Databases
  DB_DIR_PATH: appDirectory.userData(),

  // Notifications
  NOTIFICATION_PERMISSION_PATH: path.join(appDirectory.userData(), 'notification_permissions.records'),

  // Dictionaries
  USER_DICTIONARIES_PATH: LanguageSettings.userDictionariesPath(appDirectory.userData()),
  USER_DICTIONARY_WORDS_PATH: path.join(appDirectory.userData(), 'user_dictionary_words.records'),

  // Extensions
  USER_EXTENSION_INSTALL_PATH: path.join(appDirectory.userData(), 'user_extensions')
}
