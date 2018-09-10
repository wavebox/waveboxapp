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
  * @param name: the name of the mailbox
  */
  static setDisplayName (mailbox, name) {
    return mailbox.changeData({ displayName: name })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param show: whether to show extended info
  */
  static setShowExtendedDispayName (mailbox, show) {
    return mailbox.changeData({ showExtendedDispayName: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param col: the color as either a hex string or object that contains hex key
  */
  static setColor (mailbox, col) {
    if (col === undefined || col === null) {
      return mailbox.changeData({ color: undefined })
    } else if (typeof (col) === 'object') {
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
  * Sets the priority of the first sidebar service
  * @param mailbox: the mailbox to update
  * @param priority: the new priority
  */
  static setSidebarFirstServicePriority (mailbox, priority) {
    return mailbox.changeData({ sidebarFirstServicePriority: priority })
  }

  /**
  * Sets if services should show when they are sleeping
  * @param mailbox: the mailbox to update
  * @param show: true to show, false otherwise
  */
  static setShowSleepableServiceIndicator (mailbox, show) {
    return mailbox.changeData({ showSleepableServiceIndicator: show })
  }

  /**
  * Sets the navigation bar ui location
  * @param mailbox: the mailbox to update
  * @param location: the new location
  */
  static setNavigationBarUiLocation (mailbox, location) {
    return mailbox.changeData({ navigationBarUiLocation: location })
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
  * Sets the service ui priority
  * @param mailbox: the mailbox to update
  * @param mode: the new mode
  */
  static setServiceUiPriority (mailbox, mode) {
    return mailbox.changeData({ serviceUiPriority: mode })
  }

  /**
  * Adds a service in a given location
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  * @param location: the location from ACMailbox.SERVICE_UI_LOCATIONS
  */
  static addServiceByLocation (mailbox, serviceId, location) {
    if (location === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START) {
      return MailboxReducer.addServiceToToolbarStart(mailbox, serviceId)
    } else if (location === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END) {
      return MailboxReducer.addServiceToToolbarEnd(mailbox, serviceId)
    } else {
      return MailboxReducer.addServiceToSidebar(mailbox, serviceId)
    }
  }

  /**
  * Adds a service to the sidebar
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToSidebar (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? MailboxReducer.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.sidebarServices = (mailboxJS.sidebarServices || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Adds a service to the toolbar start
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToToolbarStart (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? MailboxReducer.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.toolbarStartServices = (mailboxJS.toolbarStartServices || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Adds a service to the toolbar end
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static addServiceToToolbarEnd (mailbox, serviceId) {
    const mailboxJS = mailbox.hasServiceWithId(serviceId) ? MailboxReducer.removeService(mailbox, serviceId) : mailbox.cloneData()
    mailboxJS.toolbarEndServices = (mailboxJS.toolbarEndServices || []).concat([serviceId])
    return mailboxJS
  }

  /**
  * Moves all services to the sidebar
  * @param mailbox: the mailbox to update
  */
  static moveAllServicesToSidebar (mailbox) {
    return mailbox.changeData({
      sidebarServices: mailbox.allServices,
      toolbarStartServices: [],
      toolbarEndServices: []
    })
  }

  /**
  * Moves all services to the toolbar start
  * @param mailbox: the mailbox to update
  */
  static moveAllServicesToToolbarStart (mailbox) {
    return mailbox.changeData({
      sidebarServices: [],
      toolbarStartServices: mailbox.allServices,
      toolbarEndServices: []
    })
  }

  /**
  * Moves all services to the toolbar end
  * @param mailbox: the mailbox to update
  */
  static moveAllServicesToToolbarEnd (mailbox) {
    return mailbox.changeData({
      sidebarServices: [],
      toolbarStartServices: [],
      toolbarEndServices: mailbox.allServices
    })
  }

  /**
  * Removes a service
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service
  */
  static removeService (mailbox, serviceId) {
    const mailboxJS = mailbox.cloneData()
    mailboxJS.sidebarServices = (mailboxJS.sidebarServices || []).filter((id) => id !== serviceId)
    mailboxJS.toolbarStartServices = (mailboxJS.toolbarStartServices || []).filter((id) => id !== serviceId)
    mailboxJS.toolbarEndServices = (mailboxJS.toolbarEndServices || []).filter((id) => id !== serviceId)
    return mailboxJS
  }

  /**
  * Changes a service index
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service to move
  * @param nextIndex: the next index of the service
  */
  static changeServiceIndex (mailbox, serviceId, nextIndex) {
    if (mailbox.sidebarHasServiceWithId(serviceId)) {
      return MailboxReducer.changeSidebarServiceIndex(mailbox, serviceId, nextIndex)
    } else if (mailbox.toolbarStartHasServiceWithId(serviceId)) {
      return MailboxReducer.changeToolbarStartServiceIndex(mailbox, serviceId, nextIndex)
    } else if (mailbox.toolbarEndHasServiceWithId(serviceId)) {
      return MailboxReducer.changeToolbarEndServiceIndex(mailbox, serviceId, nextIndex)
    } else {
      return undefined
    }
  }

  /**
  * Changes a service index in the sidebar
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service to move
  * @param nextIndex: the next index of the service
  */
  static changeSidebarServiceIndex (mailbox, serviceId, nextIndex) {
    const mailboxJS = mailbox.cloneData()
    if (!mailboxJS.sidebarServices) { return undefined }
    const prevIndex = mailboxJS.sidebarServices.findIndex((s) => s === serviceId)
    if (prevIndex === -1) { return undefined }
    mailboxJS.sidebarServices.splice(nextIndex, 0, mailboxJS.sidebarServices.splice(prevIndex, 1)[0])
    return mailboxJS
  }

  /**
  * Changes a service index in the toolbar start
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service to move
  * @param nextIndex: the next index of the service
  */
  static changeToolbarStartServiceIndex (mailbox, serviceId, nextIndex) {
    const mailboxJS = mailbox.cloneData()
    if (!mailboxJS.toolbarStartServices) { return undefined }
    const prevIndex = mailboxJS.toolbarStartServices.findIndex((s) => s === serviceId)
    if (prevIndex === -1) { return undefined }
    mailboxJS.toolbarStartServices.splice(nextIndex, 0, mailboxJS.toolbarStartServices.splice(prevIndex, 1)[0])
    return mailboxJS
  }

  /**
  * Changes a service index in the toolbar end
  * @param mailbox: the mailbox to update
  * @param serviceId: the id of the service to move
  * @param nextIndex: the next index of the service
  */
  static changeToolbarEndServiceIndex (mailbox, serviceId, nextIndex) {
    const mailboxJS = mailbox.cloneData()
    if (!mailboxJS.toolbarEndServices) { return undefined }
    const prevIndex = mailboxJS.toolbarEndServices.findIndex((s) => s === serviceId)
    if (prevIndex === -1) { return undefined }
    mailboxJS.toolbarEndServices.splice(nextIndex, 0, mailboxJS.toolbarEndServices.splice(prevIndex, 1)[0])
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

  /**
  * Sets whether to open drive links in the default browser
  * @param mailbox: the mailbox that contains the service
  * @param mode: the new mode
  */
  static setOpenDriveLinksWithExternalBrowser (mailbox, open) {
    return mailbox.changeData({ openGoogleDriveLinksWithExternalBrowser: open })
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
