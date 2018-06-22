import ACMailbox from '../../../Models/ACAccounts/ACMailbox'

class MailboxReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MailboxReducer' }

  /* **************************************************************************/
  // Cookies
  /* **************************************************************************/

  /**
  * Artificially persist the cookies for this mailbox
  * @param mailbox: the mailbox to update
  * @param persist: whether to persist the cookies
  */
  static setArtificiallyPersistCookies (mailbox, persist) {
    return mailbox.changeData({ artificiallyPersistCookies: persist })
  }

  /* **************************************************************************/
  // Display
  /* **************************************************************************/

  /**
  * @param mailbox: the mailbox to update
  * @param col: the color as either a hex string or object that contains hex key
  */
  static setColor (mailbox, col) {
    if (typeof (col) === 'object') {
      return mailbox.changeData({ color: col.rgbaStr })
    } else if (typeof (col) === 'string') {
      return mailbox.changeData({ color: col.trim() })
    } else {
      return undefined
    }
  }

  /**
  * @param mailbox: the mailbox to update
  * @param show: true to show the coloured ring around the mailbox avatars
  */
  static setShowAvatarColorRing (mailbox, show) {
    return mailbox.changeData({ showAvatarColorRing: show })
  }

  /**
  * Sets if services are displayed in the sidebar when the account is not the active one
  * @param mailbox: the mailbox to update
  * @param collapse: true to collapse, false otherwise
  */
  static setCollapseSidebarServices (mailbox, collapse) {
    return mailbox.changeData({ collapseSidebarServices: collapse })
  }

  /**
  * Sets if services should show when they are sleeping
  * @param mailbox: the mailbox to update
  * @param show: true to show, false otherwise
  */
  static setShowSleepableServiceIndicator (mailbox, show) {
    return mailbox.changeData({ showSleepableServiceIndicator: show })
  }

  /* **************************************************************************/
  // Badge
  /* **************************************************************************/

  /**
  * Sets if the cumulative sidebar badge should be shown
  * @param mailbox: the mailbox to update
  * @param show: true to show, false otherwise
  */
  static setShowBadge (mailbox, show) {
    return mailbox.changeData({ showBadge: show })
  }

  /**
  * Sets the cumulative sidebar badge color
  * @param mailbox: the mailbox to update
  * @param col: the color to set
  */
  static setBadgeColor (mailbox, col) {
    if (typeof (col) === 'object') {
      return mailbox.changeData({ badgeColor: col.rgbaStr })
    } else if (typeof (col) === 'string') {
      return mailbox.changeData({ badgeColor: col.trim() })
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Lifecycle & Ordering
  /* **************************************************************************/

  /**
  * Adds a service in a given location
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  * @param location: the location from ACMailbox.SERVICE_UI_LOCATIONS
  */
  static addServiceByLocation (mailbox, serviceId, location) {
    if (location === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START) {
      return this.addServiceToToolbarStart(mailbox, serviceId)
    } else if (location === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END) {
      return this.addServiceToToolbarEnd(mailbox, serviceId)
    } else {
      return this.addServiceToSidebar(mailbox, serviceId)
    }
  }

  /**
  * Adds a service to the sidebar
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToSidebar (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? this.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.sidebarServices = (mailboxJS.sidebarServices || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Adds a service to the toolbar start
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToToolbarStart (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? this.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.toolbarStartServies = (mailboxJS.toolbarStartServies || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Adds a service to the toolbar end
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToToolbarEnd (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? this.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.toolbarEndServies = (mailboxJS.toolbarEndServies || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Removes a service
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static removeService (mailbox, serviceId) {
    const mailboxJS = mailbox.cloneData()
    mailboxJS.sidebarServices = (mailboxJS.sidebarServices || []).filter((id) => id !== serviceId)
    mailboxJS.toolbarStartServies = (mailboxJS.toolbarStartServies || []).filter((id) => id !== serviceId)
    mailboxJS.toolbarEndServies = (mailboxJS.toolbarEndServies || []).filter((id) => id !== serviceId)
    return mailboxJS
  }

  /* **************************************************************************/
  // Window behaviour
  /* **************************************************************************/

  /**
  * Sets the default window open mode
  * @param mailbox: the mailbox that contains the service
  * @param mode: the new mode
  */
  static setDefaultWindowOpenMode (mailbox, mode) {
    return mailbox.changeData({ defaultWindowOpenMode: mode })
  }

  /* **************************************************************************/
  // Config
  /* **************************************************************************/

  /**
  * Sets whether to use a custom user agent string or not
  * @param mailbox: the mailbox to update
  * @param use: true to use, false to not
  */
  static setUseCustomUserAgent (mailbox, use) {
    return mailbox.changeData({ useCustomUserAgent: use })
  }

  /**
  * Sets whether to use a custom user agent string or not
  * @param mailbox: the mailbox to update
  * @param str: the user agent string
  */
  static setCustomUserAgentString (mailbox, str) {
    return mailbox.changeData({ customUserAgentString: str })
  }
}

export default MailboxReducer
