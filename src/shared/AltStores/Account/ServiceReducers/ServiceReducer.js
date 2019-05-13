import { MAILBOX_SLEEP_WAIT } from 'shared/constants'
import uuid from 'uuid'

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
  * Updates the setting to show the navigation toolbar
  * @param service: the service to update
  * @param has: true to if it has the toolbar
  */
  static setHasNavigationToolbar (service, has) {
    return service.changeData({ hasNavigationToolbar: has })
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

  /**
  * Sets the service display name
  * @param service: the service to change
  * @param name: the new name
  */
  static setServiceDisplayName (service, name) {
    if (service.serviceDisplayName !== name) {
      return service.changeData({ serviceDisplayName: name })
    }
  }

  /**
  * Sets the service avatar url
  * @param service: the service to change
  * @param val: the new value
  */
  static setServiceAvatarUrl (service, val) {
    if (service.serviceAvatarURL !== val) {
      return service.changeData({ serviceAvatarURL: val })
    }
  }

  /**
  * Sets the avatar character display
  * @param service: the service to change
  * @param val: the new value
  */
  static setServiceAvatarCharacterDisplay (service, val) {
    if (service.serviceAvatarCharacterDisplay !== val) {
      return service.changeData({ serviceAvatarCharacterDisplay: val })
    }
  }

  /**
  * Sets all the service display settings
  * @param service: the service to change
  * @param displayName: the new display name
  * @param avatarURL: the new avatar url
  * @param avatarCharacterDisplay: the new avatar character display
  */
  static setAllServiceDisplay (service, displayName, avatarURL, avatarCharacterDisplay) {
    const changeset = {}
    if (service.serviceDisplayName !== displayName) {
      changeset.serviceDisplayName = displayName
    }
    if (service.serviceAvatarURL !== avatarURL) {
      changeset.serviceAvatarURL = avatarURL
    }
    if (service.serviceAvatarCharacterDisplay !== avatarCharacterDisplay) {
      changeset.serviceAvatarCharacterDisplay = avatarCharacterDisplay
    }
    if (Object.keys(changeset).length) {
      return service.changeData(changeset)
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
    value = Math.min(Math.max(value, min), max)
    return service.changeData({ sleepableTimeout: value })
  }

  /* **************************************************************************/
  // Install
  /* **************************************************************************/

  /**
  * Sets if the install text has been seen
  * @param service: the service to update
  * @param seen: true if the user has seen
  */
  static setHasSeenInstallInfo (service, seen) {
    return service.changeData({ hasSeenInstallInfo: seen })
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

  /**
  * Sets whether the service should prevent low power mode
  * @param service: the service to update
  * @param prevent: true to prevent behaviour, false otherwise
  */
  static setPreventLowPowerMode (service, prevent) {
    return service.changeData({ preventLowPowerMode: prevent })
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
  // Bookmarks
  /* **************************************************************************/

  /**
  * Adds a bookmark entry into the service
  * @param service: the parent service
  * @param recentItem: the recent item to make the bookmark from
  */
  static addBookmark (service, recentItem) {
    return service.changeData({
      bookmarks: service.bookmarks.concat({
        windowType: recentItem.windowType,
        url: recentItem.url,
        title: recentItem.title,
        favicons: recentItem.favicons,
        time: new Date().getTime(),
        id: uuid.v4()
      })
    })
  }

  /**
  * Changes a bookmark entry
  * @param service: the parent service
  * @param bookmarkId: the id of the bookmark
  * @param changeset: the change to apply to the bookmark
  */
  static changeBookmark (service, bookmarkId, changeset) {
    return service.changeData({
      bookmarks: service.bookmarks.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return {
            ...bookmark,
            ...changeset,
            // Maintain some integrity
            id: bookmark.id,
            time: bookmark.time
          }
        } else {
          return bookmark
        }
      })
    })
  }

  /**
  * Removes a bookmark entry from the service
  * @param service: the parent service
  * @param url: the url to add
  * @param title: the title of the visit
  * @param favicon: the favicon for the page
  */
  static removeBookmark (service, id) {
    return service.changeData({
      bookmarks: service.bookmarks.filter((b) => b.id !== id)
    })
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
