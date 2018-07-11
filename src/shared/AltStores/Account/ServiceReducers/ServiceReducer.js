import { MAILBOX_SLEEP_WAIT } from 'shared/constants'

class ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ServiceReducer' }

  /* **************************************************************************/
  // Display
  /* **************************************************************************/

  /**
  * Sets the display name
  * @param service: the service to update
  * @param displayName: the display name to set
  */
  static setDisplayName (service, displayName) {
    return service.changeData({ displayName: displayName || undefined })
  }

  /**
  * @param service: the service to update
  * @param col: the color as either a hex string or object that contains hex key
  */
  static setColor (service, col) {
    if (col === undefined || col === null) {
      return service.changeData({ color: undefined })
    } else if (typeof (col) === 'object') {
      return service.changeData({ color: col.rgbaStr })
    } else if (typeof (col) === 'string') {
      return service.changeData({ color: col.trim() })
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Sleepable
  /* **************************************************************************/

  /**
  * Toggles the service sleepable state
  * @param service: the service to update
  * @param sleepable: true if the service is sleepable, false otherwise
  */
  static setSleepable (service, sleepable) {
    return service.changeData({ sleepable: sleepable })
  }

  /**
  * Sets the time before sleeping
  * @param service: the service to update
  * @param timeout: the new timeout to set in millis
  */
  static setSleepableTimeout (service, timeout) {
    const min = 1000 // 1 sec
    const max = 1000 * 60 * 240 // 240 minutes, 4 hours

    let value = parseInt(timeout)
    value = isNaN(value) ? MAILBOX_SLEEP_WAIT : value
    value = Math.min(Math.max(timeout, min), max)
    return service.changeData({ sleepableTimeout: value })
  }

  /**
  * Sets if the user has seen the sleepable wizard for this account
  * @param service: the service to update
  * @param seen: true if the user has seen
  */
  static setHasSeenSleepableWizard (service, seen) {
    return service.changeData({ hasSeenSleepableWizard: seen })
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Sets if the page should restore the last url
  * @param service: the service to update
  * @param restore: true to restore the last url
  */
  static setRestoreLastUrl (service, restore) {
    return service.changeData({ restoreLastUrl: restore })
  }

  /* **************************************************************************/
  // Badge & Unread
  /* **************************************************************************/

  /**
  * @param service: the service to update
  * @param col: the color as either a hex string or object that contains hex key
  */
  static setBadgeColor (service, col) {
    if (typeof (col) === 'string') {
      return service.changeData({ badgeColor: col.trim() })
    } else if (typeof (col) === 'object') {
      return service.changeData({ badgeColor: col.rgbaStr })
    } else {
      return undefined
    }
  }

  /**
  * @param service: the service to update
  * @param show: sets whether to show the unread badge or not
  */
  static setShowBadgeCount (service, show) {
    return service.changeData({ showBadgeCount: show })
  }

  /**
  * @param service: the service to update
  * @param show: sets whther the unread counts do count towards the app unread badge
  */
  static setShowBadgeCountInApp (service, show) {
    return service.changeData({ showBadgeCountInApp: show })
  }

  /**
  * @param service: the service to update
  * @param show: sets whether to show the activity badge
  */
  static setShowBadgeActivity (service, show) {
    return service.changeData({ showBadgeActivity: show })
  }

  /**
  * @param service: the service to update
  * @param show: sets whther the unread indicator does count towards the app unread badge
  */
  static setShowBadgeActivityInApp (service, show) {
    return service.changeData({ showBadgeActivityInApp: show })
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * @param service: the service to update
  * @param show: sets whether to show notifications or not
  */
  static setShowNotifications (service, show) {
    return service.changeData({ showNotifications: show })
  }

  /**
  * @param service: the service to update
  * @param sound: the sound name to play on notifications
  */
  static setNotificationsSound (service, sound) {
    return service.changeData({ notificationsSound: sound })
  }

  /**
  * @param service: the service to update
  * @param show: true to show the avatar, false otherwise
  */
  static setShowAvatarInNotifications (service, show) {
    return service.changeData({ showAvatarInNotifications: show })
  }

  /* **************************************************************************/
  // Custom Code
  /* **************************************************************************/

  /**
  * Sets the custom css
  * @param service: the service to update
  * @param css: the css code
  */
  static setCustomCSS (service, css) {
    return service.changeData({ customCSS: css })
  }

  /**
  * Sets the custom js
  * @param service: the service to update
  * @param js: the js code
  */
  static setCustomJS (service, js) {
    return service.changeData({ customJS: js })
  }
}

export default ServiceReducer
