import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'

class MailboxReducer {
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
    return mailbox.changeData({
      color: typeof (col) === 'object' ? col.rgbaStr : col
    })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param show: true to show the coloured ring around the mailbox avatars
  */
  static setShowAvatarColorRing (mailbox, show) {
    return mailbox.changeData({
      showAvatarColorRing: show
    })
  }

  /**
  * Sets the way the services are displayed
  * @param mailbox: the mailbox to update
  * @param displayMode: the new display mode
  */
  static setServiceDisplayMode (mailbox, displayMode) {
    return mailbox.changeData({
      serviceDisplayMode: displayMode
    })
  }

  /**
  * Changes the layout mode for the service icons in the toolbar
  * @param mailbox: them mailbox to update
  * @param layout: the new layout mode
  */
  static setServiceToolbarIconLayout (mailbox, layout) {
    return mailbox.changeData({
      serviceToolbarIconLayout: layout
    })
  }

  /**
  * Sets if services are displayed in the sidebar when the account is not the active one
  * @param mailbox: the mailbox to update
  * @param collapse: true to collapse, false otherwise
  */
  static setCollapseSidebarServices (mailbox, collapse) {
    return mailbox.changeData({
      collapseSidebarServices: collapse
    })
  }

  /**
  * Sets if services should show when they are sleeping
  * @param mailbox: the mailbox to update
  * @param show: true to show, false otherwise
  */
  static setShowSleepableServiceIndicator (mailbox, show) {
    return mailbox.changeData({
      showSleepableServiceIndicator: show
    })
  }

  /* **************************************************************************/
  // Badge
  /* **************************************************************************/

  /**
  * Sets if the cumulative sidebar badge should be shown
  * @param mailbox: the mailbox to update
  * @param show: true to show, false otherwise
  */
  static setShowCumulativeSidebarUnreadBadge (mailbox, show) {
    return mailbox.changeData({
      showCumulativeSidebarUnreadBadge: show
    })
  }

  /**
  * Sets the cumulative sidebar badge color
  * @param mailbox: the mailbox to update
  * @param col: the color to set
  */
  static setCumulativeSidebarUnreadBadgeColor (mailbox, col) {
    return mailbox.changeData({
      cumulativeSidebarUnreadBadgeColor: typeof (col) === 'object' ? col.rgbaStr : col
    })
  }

  /* **************************************************************************/
  // Lifecycle & Ordering
  /* **************************************************************************/

  /**
  * Adds a service
  * @param mailbox: the mailbox to update
  * @param serviceType: the service type
  */
  static addService (mailbox, serviceType) {
    if (!mailbox.serviceForType(serviceType)) {
      const mailboxJS = mailbox.cloneData()
      mailboxJS.services.push(ServiceFactory.getClass(mailbox.type, serviceType).createJS())
      return mailboxJS
    } else {
      return undefined
    }
  }

  /**
  * Removes a service
  * @param mailbox: the mailbox to update
  * @param serviceType: the service type
  */
  static removeService (mailbox, serviceType) {
    const mailboxJS = mailbox.cloneData()
    mailboxJS.services = mailboxJS.services.filter((s) => s.type !== serviceType)
    return mailboxJS
  }

  /**
  * Moves a service up
  * @param mailbox: the mailbox to update
  * @param serviceType: the service type
  */
  static moveServiceUp (mailbox, serviceType) {
    const mailboxJS = mailbox.cloneData()
    const index = mailboxJS.services.findIndex((s) => s.type === serviceType)
    if (index !== -1 && index !== 0) {
      mailboxJS.services.splice(index - 1, 0, mailboxJS.services.splice(index, 1)[0])
      return mailboxJS
    } else {
      return undefined
    }
  }

  /**
  * Moves a service down
  * @param mailbox: the mailbox to update
  * @param serviceType: the service type
  */
  static moveServiceDown (mailbox, serviceType) {
    const mailboxJS = mailbox.cloneData()
    const index = mailboxJS.services.findIndex((s) => s.type === serviceType)
    if (index !== -1 && index < mailboxJS.services.length) {
      mailboxJS.services.splice(index + 1, 0, mailboxJS.services.splice(index, 1)[0])
      return mailboxJS
    } else {
      return undefined
    }
  }

  /**
  * Changes a service index
  * @param mailbox: the mailbox to update
  * @param serviceType: the service type to move
  * @param nextIndex: the next index of the service
  */
  static changeServiceIndex (mailbox, serviceType, nextIndex) {
    const mailboxJS = mailbox.cloneData()
    const prevIndex = mailboxJS.services.findIndex((s) => s.type === serviceType)
    if (prevIndex !== -1) {
      mailboxJS.services.splice(nextIndex, 0, mailboxJS.services.splice(prevIndex, 1)[0])
      return mailboxJS
    } else {
      return undefined
    }
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
}

export default MailboxReducer
