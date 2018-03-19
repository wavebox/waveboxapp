import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class OSSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.OS, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * @param ask: true to always ask, false otherwise
  */
  setAlwaysAskDownloadLocation (ask) {
    this.dispatchUpdate('alwaysAskDownloadLocation', ask)
  }

  /**
  * @param path: the path to download files to automatically
  */
  setDefaultDownloadLocation (path) {
    this.dispatchUpdate('defaultDownloadLocation', path)
  }

  /**
  * @param enabled: true to enable download complete notifications
  */
  setDownloadNotificationEnabled (enabled) {
    this.dispatchUpdate('downloadNotificationEnabled', enabled)
  }

  /**
  * @param enabled: true to enable sound on download complete notifications
  */
  setDownloadNotificationSoundEnabled (enabled) {
    this.dispatchUpdate('downloadNotificationSoundEnabled', enabled)
  }

  /**
  * @param enabled: true to enable notifications, false otherwise
  */
  setNotificationsEnabled (enabled) {
    this.dispatchUpdate('notificationsEnabled', enabled)
  }

  /**
  * @param silent: true to make notifications silent, false otherwise
  */
  setNotificationsSilent (silent) {
    this.dispatchUpdate('notificationsSilent', silent)
  }

  /**
  * @param provider: the new provider to use
  */
  setNotificationsProvider (provider) {
    this.dispatchUpdate('notificationsProvider', provider)
  }

  /**
  * @param sound: the new sound to use
  */
  setNotificationsSound (sound) {
    this.dispatchUpdate('notificationsSound', sound)
  }

  /**
  * Mutes the notification for a certain amount of hours
  * @param hours: the hours to mute for
  */
  muteNotificationsForHours (hours) {
    const now = new Date().getTime()
    const epoch = now + (1000 * 60 * 60 * hours)
    this.dispatchUpdate('notificationsMutedEndEpoch', epoch)
  }

  /**
  * Clears the notification mute
  */
  clearNotificationMute () {
    this.dispatchUpdate('notificationsMutedEndEpoch', null)
  }

  /**
  * @param background: true to open links in the background
  */
  setOpenLinksInBackground (background) {
    this.dispatchUpdate('openLinksInBackground', background)
  }

  /**
  * @param mode: the login open mode
  */
  setLoginOpenMode (mode) {
    this.dispatchUpdate('loginOpenMode', mode)
  }
}

export default OSSettingsActions
