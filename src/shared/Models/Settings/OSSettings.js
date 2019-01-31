const Model = require('../Model')
const {
  NOTIFICATION_PROVIDERS,
  DEFAULT_NOTIFICATION_PROVIDER,
  DEFAULT_NOTIFICATION_SOUND
} = require('../../Notifications')

const COMMAND_LINK_BEHAVIOUR = Object.freeze({
  DEFAULT: 'DEFAULT',
  BROWSER_OPEN: 'BROWSER_OPEN',
  WAVEBOX_OPEN: 'WAVEBOX_OPEN',
  ASK: 'ASK'
})

class OSSettings extends Model {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get DEFAULT_NOTIFICATION_PROVIDER () { return DEFAULT_NOTIFICATION_PROVIDER }
  static get NOTIFICATION_PROVIDERS () { return NOTIFICATION_PROVIDERS }
  static get COMMAND_LINK_BEHAVIOUR () { return COMMAND_LINK_BEHAVIOUR }

  /* ****************************************************************************/
  // Downloads
  /* ****************************************************************************/

  get alwaysAskDownloadLocation () { return this._value_('alwaysAskDownloadLocation', true) }
  get defaultDownloadLocation () { return this._value_('defaultDownloadLocation', undefined) }
  get downloadNotificationEnabled () { return this._value_('downloadNotificationEnabled', true) }
  get downloadNotificationSoundEnabled () { return this._value_('downloadNotificationSoundEnabled', true) }
  get rawUseAsyncDownloadHandler () { return this._value_('useAsyncDownloadHandler', undefined) }

  /* ****************************************************************************/
  // Notifications
  /* ****************************************************************************/

  get notificationsEnabled () { return this._value_('notificationsEnabled', true) }
  get notificationsSilent () { return this._value_('notificationsSilent', false) }
  get notificationsProvider () {
    return this._value_('notificationsProvider', process.platform === 'darwin' ? NOTIFICATION_PROVIDERS.ENHANCED : NOTIFICATION_PROVIDERS.ELECTRON)
  }
  get notificationsSound () { return this._value_('notificationsSound', DEFAULT_NOTIFICATION_SOUND) }
  get notificationsMutedEndEpoch () { return this._value_('notificationsMutedEndEpoch', null) }
  get notificationsMuted () {
    if (this.notificationsMutedEndEpoch === null) { return false }
    if (new Date().getTime() > this.notificationsMutedEndEpoch) { return false }
    return true
  }
  get rawNotificationsMutedWhenSuspended () { return this._value_('notificationsMutedWhenSuspended', undefined) }

  /* ****************************************************************************/
  // Links
  /* ****************************************************************************/

  get openLinksInBackground () { return this._value_('openLinksInBackground', false) }
  get linkBehaviourWithShift () { return this._value_('linkBehaviourWithShift', COMMAND_LINK_BEHAVIOUR.DEFAULT) }
  get linkBehaviourWithCmdOrCtrl () { return this._value_('linkBehaviourWithCmdOrCtrl', COMMAND_LINK_BEHAVIOUR.BROWSER_OPEN) }
  get customLinkProviders () { return this._value_('customLinkProviders', {}) }
  get customLinkProviderIds () { return Object.keys(this.customLinkProviders) }
  get customLinkProviderNames () {
    const val = this.customLinkProviders
    return Object.keys(val).reduce((acc, k) => {
      acc[k] = val[k].name
      return acc
    }, {})
  }

  /**
  * @param providerId: the id of the link provider
  * @return the provider or undefined
  */
  getCustomLinkProvider (providerId) { return this.customLinkProviders[providerId] }

  /**
  * @param providerId: the id of the link provider
  * @return true if there is a provider with this id, false otherwise
  */
  hasCustomLinkProvider (providerId) { return !!this.getCustomLinkProvider(providerId) }
}

module.exports = OSSettings
