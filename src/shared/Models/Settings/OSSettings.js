const Model = require('../Model')

class OSSettings extends Model {
  get alwaysAskDownloadLocation () { return this._value_('alwaysAskDownloadLocation', true) }
  get defaultDownloadLocation () { return this._value_('defaultDownloadLocation', undefined) }
  get downloadNotificationEnabled () { return this._value_('downloadNotificationEnabled', true) }
  get downloadNotificationSoundEnabled () { return this._value_('downloadNotificationSoundEnabled', true) }

  get notificationsEnabled () { return this._value_('notificationsEnabled', true) }
  get notificationsSilent () { return this._value_('notificationsSilent', false) }
  get openLinksInBackground () { return this._value_('openLinksInBackground', false) }
}

module.exports = OSSettings
