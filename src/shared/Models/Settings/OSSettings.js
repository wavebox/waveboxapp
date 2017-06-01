const Model = require('../Model')

const NOTIFICATION_PROVIDERS = Object.freeze({
  ELECTRON: 'ELECTRON',
  ENHANCED: 'ENHANCED'
})

class OSSettings extends Model {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get DEFAULT_NOTIFICATION_PROVIDER () { return NOTIFICATION_PROVIDERS.ELECTRON }
  static get NOTIFICATION_PROVIDERS () { return NOTIFICATION_PROVIDERS }

  /* ****************************************************************************/
  // Downloads
  /* ****************************************************************************/

  get alwaysAskDownloadLocation () { return this._value_('alwaysAskDownloadLocation', true) }
  get defaultDownloadLocation () { return this._value_('defaultDownloadLocation', undefined) }
  get downloadNotificationEnabled () { return this._value_('downloadNotificationEnabled', true) }
  get downloadNotificationSoundEnabled () { return this._value_('downloadNotificationSoundEnabled', true) }

  /* ****************************************************************************/
  // Notifications
  /* ****************************************************************************/

  get notificationsEnabled () { return this._value_('notificationsEnabled', true) }
  get notificationsSilent () { return this._value_('notificationsSilent', false) }
  get notificationsProvider () { return this._value_('notificationsProvider', NOTIFICATION_PROVIDERS.ENHANCED) }

  /* ****************************************************************************/
  // Misc
  /* ****************************************************************************/

  get openLinksInBackground () { return this._value_('openLinksInBackground', false) }
}

module.exports = OSSettings
