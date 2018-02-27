const Model = require('../Model')
const {
  NOTIFICATION_PROVIDERS,
  DEFAULT_NOTIFICATION_PROVIDER,
  DEFAULT_NOTIFICATION_SOUND
} = require('../../Notifications')

class OSSettings extends Model {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get DEFAULT_NOTIFICATION_PROVIDER () { return DEFAULT_NOTIFICATION_PROVIDER }
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
  get notificationsProvider () { return this._value_('notificationsProvider', NOTIFICATION_PROVIDERS.ELECTRON) }
  get notificationsSound () { return this._value_('notificationsSound', DEFAULT_NOTIFICATION_SOUND) }
  get notificationsMutedEndEpoch () { return this._value_('notificationsMutedEndEpoch', null) }
  get notificationsMuted () {
    if (this.notificationsMutedEndEpoch === null) { return false }
    if (new Date().getTime() > this.notificationsMutedEndEpoch) { return false }
    return true
  }

  /* ****************************************************************************/
  // Misc
  /* ****************************************************************************/

  get openLinksInBackground () { return this._value_('openLinksInBackground', false) }
}

module.exports = OSSettings
