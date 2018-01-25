import { MAILBOX_SLEEP_WAIT } from 'shared/constants'

class ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ServiceReducer' }

  /* **************************************************************************/
  // Urls
  /* **************************************************************************/

  /**
  * Sets the last url of the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param url: the current url
  */
  static setLastUrl (mailbox, service, url) {
    return service.changeData({
      lastUrl: { url: url, baseUrl: service.url }
    })
  }

  /**
  * Sets whether the last url should be restored or not
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param restore: true to restore, false otherwise
  */
  static setRestoreLastUrl (mailbox, service, restore) {
    return service.changeData({ restoreLastUrl: restore })
  }

  /* **************************************************************************/
  // Sleepable
  /* **************************************************************************/

  /**
  * Toggles the service sleepable state
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param sleepable: true if the service is sleepable, false otherwise
  */
  static setSleepable (mailbox, service, sleepable) {
    return service.changeData({ sleepable: sleepable })
  }

  /**
  * Sets the time before sleeping
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param timeout: the new timeout to set in millis
  */
  static setSleepableTimeout (mailbox, service, timeout) {
    const min = 1000 // 1 sec
    const max = 6000 * 1000 // 100 minutes

    let value = parseInt(timeout)
    value = isNaN(value) ? MAILBOX_SLEEP_WAIT : value
    value = Math.min(Math.max(timeout, min), max)
    return service.changeData({ sleepableTimeout: value })
  }

  /**
  * Sets if the user has seen the sleepable wizard for this account
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param seen: true if the user has seen
  */
  static setHasSeenSleepableWizard (mailbox, service, seen) {
    return service.changeData({ hasSeenSleepableWizard: seen })
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param show: sets whether to show the unread badge or not
  */
  static setShowUnreadBadge (mailbox, service, show) {
    return service.changeData({ showUnreadBadge: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param doesCount: sets whther the unread counts do count towards the app unread badge
  */
  static setUnreadCountsTowardsAppUnread (mailbox, service, doesCount) {
    return service.changeData({ unreadCountsTowardsAppUnread: doesCount })
  }

  /**
  * @oaram mailbox: the mailbox to update
  * @param service: the service to update
  * @param show: sets whether to show the activity badge
  */
  static setShowUnreadActivityBadge (mailbox, service, show) {
    return service.changeData({ showUnreadActivityBadge: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param doesCount: sets whther the unread indicator does count towards the app unread badge
  */
  static setUnreadActivityCountsTowardsAppUnread (mailbox, service, doesCount) {
    return service.changeData({ unreadActivityCountsTowardsAppUnread: doesCount })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param show: sets whether to show notifications or not
  */
  static setShowNotifications (mailbox, service, show) {
    return service.changeData({ showNotifications: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param sound: the sound name to play on notifications
  */
  static setNotificationsSound (mailbox, service, sound) {
    return service.changeData({ notificationsSound: sound })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param show: true to show the avatar, false otherwise
  */
  static setShowAvatarInNotifications (mailbox, service, show) {
    return service.changeData({ showAvatarInNotifications: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param col: the color as either a hex string or object that contains hex key
  */
  static setUnreadBadgeColor (mailbox, service, col) {
    return service.changeData({
      unreadBadgeColor: typeof (col) === 'object' ? col.rgbaStr : col
    })
  }

  /* **************************************************************************/
  // Zoom
  /* **************************************************************************/

  /**
  * Increases the zoom of the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static increaseZoom (mailbox, service) {
    return service.changeData({
      zoomFactor: Math.min(1.5, service.zoomFactor + 0.1)
    })
  }

  /**
  * Decreases the zoom of the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static decreaseZoom (mailbox, service) {
    return service.changeData({
      zoomFactor: Math.max(0.5, service.zoomFactor - 0.1)
    })
  }

  /**
  * Resets the zoom of the the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static resetZoom (mailbox, service) {
    return service.changeData({ zoomFactor: 1.0 })
  }

  /* **************************************************************************/
  // Custom Code
  /* **************************************************************************/

  /**
  * Sets the custom css
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param css: the css code
  */
  static setCustomCSS (mailbox, service, css) {
    return service.changeData({ customCSS: css })
  }

  /**
  * Sets the custom js
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param js: the js code
  */
  static setCustomJS (mailbox, service, js) {
    return service.changeData({ customJS: js })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Runs the mergeChangesetOnActive merge on the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static mergeChangesetOnActive (mailbox, service) {
    if (service.mergeChangesetOnActive) {
      return service.changeData(service.mergeChangesetOnActive)
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Adaptor
  /* **************************************************************************/

  /**
  * Sets the adaptor unread activity
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param hasActivity: true if there is activity, false otherwise
  */
  static setAdaptorHasUnreadActivity (mailbox, service, hasActivity) {
    if (!service.supportsGuestConfig) { return undefined }
    return service.changeData({ '::guestConfig:hasUnreadActivity': hasActivity })
  }

  /**
  * Sets the adaptor unread count
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param count: the new count
  */
  static setAdaptorUnreadCount (mailbox, service, count) {
    if (!service.supportsGuestConfig) { return undefined }
    return service.changeData({ '::guestConfig:unreadCount': count })
  }

  /**
  * Sets the adaptor tray messages
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param messages: the array of messages
  */
  static setAdaptorTrayMessages (mailbox, service, messages) {
    if (!service.supportsGuestConfig) { return undefined }
    return service.changeData({ '::guestConfig:trayMessages': messages })
  }
}

export default ServiceReducer
