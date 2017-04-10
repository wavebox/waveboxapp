const ServiceFactory = require('shared/Models/Accounts/ServiceFactory')

class MailboxReducer {
  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * @param mailbox: the mailbox to update
  * @param show: sets whether to show the unread badge or not
  */
  static setShowUnreadBadge (mailbox, show) {
    return mailbox.changeData({ showUnreadBadge: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param show: sets whether to show notifications or not
  */
  static setShowNotifications (mailbox, show) {
    return mailbox.changeData({ showNotifications: show })
  }

  /**
  * @param mailbox: the mailbox to update
  * @param doesCount: sets whther the unread counts do count towards the app unread badge
  */
  static setUnreadCountsTowardsAppUnread (mailbox, doesCount) {
    return mailbox.changeData({ unreadCountsTowardsAppUnread: doesCount })
  }

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
      color: typeof (col) === 'object' ? col.hex : col
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
  * Sets if services are displayed in the sidebar when the account is not the active one
  * @param mailbox: the mailbox to update
  * @param collapse: true to collapse, false otherwise
  */
  static setCollapseSidebarServices (mailbox, collapse) {
    return mailbox.changeData({
      collapseSidebarServices: collapse
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
  * @param service: the service type
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
  * @param service: the service type
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
}

module.exports = MailboxReducer
