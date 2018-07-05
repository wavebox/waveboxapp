import { EventEmitter } from 'events'
import { NOTIFICATION_MAX_AGE, NOTIFICATION_FIRST_RUN_GRACE_MS } from 'shared/constants'
import { accountStore, accountActions, accountDispatch } from 'stores/account'
import { settingsStore } from 'stores/settings'
import NotificationRenderer from './NotificationRenderer'
import { WB_FOCUS_APP } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class NotificationService extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.__state__ = this.getInitialState()
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isRunning () { return this.__state__.isRunning }
  get suppressForGrace () { return new Date().getTime() - this.__state__.startedTime < NOTIFICATION_FIRST_RUN_GRACE_MS }

  /* **************************************************************************/
  // Service Lifecycle
  /* **************************************************************************/

  /**
  * Starts the service
  * @return this
  */
  start () {
    if (this.isRunning) { return }
    this.__state__ = this.getInitialState()
    this.__state__.isRunning = true
    accountStore.listen(this.accountChanged)

    this.accountChanged()
    return this
  }

  /**
  * Stops the service
  * @return this
  */
  stop () {
    if (!this.isRunning) { return }
    this.__state__.isRunning = false
    accountStore.unlisten(this.accountChanged)
    return this
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      isRunning: false,
      startedTime: new Date().getTime(),
      sent: new Map()
    }
  }

  accountChanged = (accountState = accountStore.getState()) => {
    this.processNewServiceNotifications(accountState)
  }

  /* **************************************************************************/
  // Notification Processors
  /* **************************************************************************/

  /**
  * Processes a new mailbox notification thats been pushed from a server source
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceId: the id of the service thisis for
  * @param notification: the notification to push
  */
  processPushedMailboxNotification (mailboxId, serviceId, notification) {
    // Check we're allowed to display
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }
    if (!service.showNotifications) { return }

    NotificationRenderer.presentMailboxNotification(
      mailboxId,
      serviceId,
      notification,
      (data) => {
        ipcRenderer.send(WB_FOCUS_APP, { })
        if (data) {
          accountActions.changeActiveService(data.serviceId)
          accountDispatch.openItem(data.serviceId, data)
        }
      }
    )
  }

  /**
  * Processes a new mailbox notification that can have most of its handling done elesewhere
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceID: the id of service the notification is for
  * @param notification: the notification to push
  * @param clickHandler: the click handler to call
  */
  processHandledMailboxNotification (mailboxId, serviceId, notification, clickHandler) {
    NotificationRenderer.presentMailboxNotification(
      mailboxId,
      serviceId,
      notification,
      (data) => {
        // Switch across to the mailbox if we were provided with enough info
        ipcRenderer.send(WB_FOCUS_APP, { })
        if (data && data.serviceId) {
          accountActions.changeActiveService(data.serviceId)
        }

        // Call the click handler back
        clickHandler(data)
      }
    )
  }

  /**
  * Processes a new html5 notification thats been pushed from a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of service this is for
  * @param notificationId: the id of the notification to pass back to the webview
  * @param notification: the notification info to push split into { title, options }
  * @param clickHandler=undefined: the handler to call on click
  */
  processHTML5MailboxNotification (mailboxId, serviceId, notificationId, notification, clickHandler = undefined) {
    NotificationRenderer.presentHtml5MailboxNotification(
      mailboxId,
      serviceId,
      notification.title,
      {
        body: (notification.options || {}).body,
        silent: (notification.options || {}).silent,
        icon: (notification.options || {}).icon
      },
      (data) => {
        ipcRenderer.send(WB_FOCUS_APP, { })
        accountActions.changeActiveService(serviceId)
        if (data.clickHandler) {
          data.clickHandler(notificationId)
        }
      },
      {
        notificationId: notificationId,
        mailboxId: mailboxId,
        serviceId: serviceId,
        clickHandler: clickHandler
      })
  }

  /**
  * Processes a test notification
  * @param title: the title to show
  * @param body: the body to show
  */
  processTestNotification (title, body) {
    NotificationRenderer.presentNotification(
      title,
      { body: body, silent: false },
      (data) => { ipcRenderer.send(WB_FOCUS_APP, { }) },
      {})
  }

  /**
  * Processes new notifications and prepares them for firing
  * @param accountState: the current account state
  */
  processNewServiceNotifications (accountState) {
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const now = new Date().getTime()
    const pendingNotifications = []

    // Look for notifications to send
    accountState.allServicesUnordered().forEach((service) => {
      if (!service.supportsSyncedDiffNotifications) { return }
      if (!service.showNotifications) { return }

      const serviceData = accountState.getServiceData(service.id)
      serviceData.notifications.forEach((notification) => {
        const id = `${service.id}:${notification.id}`
        if (this.__state__.sent.has(id)) { return }
        if (now - notification.timestamp > NOTIFICATION_MAX_AGE) { return }
        if (this.suppressForGrace) {
          this.__state__.sent.set(id, now)
          return
        }

        pendingNotifications.push({
          mailboxId: service.parentId,
          serviceId: service.id,
          notification: notification
        })

        this.__state__.sent.set(id, now)
      })
    })

    // Clear out any really old sent records to preserve memory
    this.__state__.sent.forEach((timestamp, id) => {
      if (now - timestamp > NOTIFICATION_MAX_AGE * 2) {
        this.__state__.sent.delete(id)
      }
    })

    // Send the notifications we found
    if (pendingNotifications.length) {
      pendingNotifications.forEach(({ mailboxId, serviceId, notification }) => {
        NotificationRenderer.presentMailboxNotification(
          mailboxId,
          serviceId,
          notification,
          (data) => {
            ipcRenderer.send(WB_FOCUS_APP, { })
            if (data) {
              accountActions.changeActiveService(data.serviceId)
              accountDispatch.openItem(data.serviceId, data)
            }
          },
          accountState,
          settingsState
        )
      })
    }
  }
}

export default new NotificationService()
