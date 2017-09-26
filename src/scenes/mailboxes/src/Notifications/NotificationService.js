import { EventEmitter } from 'events'
import { NOTIFICATION_MAX_AGE, NOTIFICATION_FIRST_RUN_GRACE_MS } from 'shared/constants'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
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
    this.__listeners__ = {
      mailboxStore: this.mailboxChanged.bind(this)
    }
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
    mailboxStore.listen(this.__listeners__.mailboxStore)

    this.mailboxChanged()
    return this
  }

  /**
  * Stops the service
  * @return this
  */
  stop () {
    if (!this.isRunning) { return }
    this.__state__.isRunning = false
    mailboxStore.unlisten(this.__listeners__.mailboxStore)
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

  mailboxChanged (mailboxState = mailboxStore.getState()) {
    this.processNewMailboxNotifications(mailboxState)
  }

  /* **************************************************************************/
  // Notification Processors
  /* **************************************************************************/

  /**
  * Processes a new mailbox notification thats been pushed from a server source
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification to push
  */
  processPushedMailboxNotification (mailboxId, serviceType, notification) {
    // Check we're allowed to display
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(serviceType)
    if (!service) { return }
    if (!service.showNotifications) { return }

    NotificationRenderer.presentMailboxNotification(
      mailboxId,
      serviceType,
      notification,
      (data) => {
        ipcRenderer.send(WB_FOCUS_APP, { })
        if (data) {
          mailboxActions.changeActive(data.mailboxId, data.serviceType)
          mailboxDispatch.openItem(data.mailboxId, data.serviceType, data)
        }
      }
    )
  }

  /**
  * Processes a new mailbox notification that can have most of its handling done elesewhere
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification to push
  * @param clickHandler: the click handler to call
  */
  processHandledMailboxNotification (mailboxId, serviceType, notification, clickHandler) {
    NotificationRenderer.presentMailboxNotification(
      mailboxId,
      serviceType,
      notification,
      (data) => {
        // Switch across to the mailbox if we were provided with enough info
        ipcRenderer.send(WB_FOCUS_APP, { })
        if (data && data.mailboxId && data.serviceType) {
          mailboxActions.changeActive(data.mailboxId, data.serviceType)
        }

        // Call the click handler back
        clickHandler(data)
      }
    )
  }

  /**
  * Processes a new html5 notification thats been pushed from a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service this is for
  * @param notificationId: the id of the notification to pass back to the webview
  * @param notification: the notification info to push split into { title, options }
  * @param clickHandler=undefined: the handler to call on click
  */
  processHTML5MailboxNotification (mailboxId, serviceType, notificationId, notification, clickHandler = undefined) {
    // Check we're allowed to display
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(serviceType)
    if (!service) { return }
    if (!service.showNotifications) { return }

    NotificationRenderer.presentNotification(
      notification.title,
      {
        body: (notification.options || {}).body,
        silent: (notification.options || {}).silent,
        icon: (notification.options || {}).icon
      },
      (data) => {
        ipcRenderer.send(WB_FOCUS_APP, { })
        mailboxActions.changeActive(mailboxId, serviceType)
        if (data.clickHandler) {
          data.clickHandler(notificationId)
        }
      },
      {
        notificationId: notificationId,
        mailboxId: mailboxId,
        serviceType: serviceType,
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
  * Processes a new html5 notification thats been pushed from a hosted extension
  * @param notificationId: the id of the notification to pass back to the webview
  * @param notification: the notification info to push split into { title, options }
  * @param clickHandler=undefined: the handler to call on click
  */
  processHTML5HostedExtensionNotification (notificationId, notification, clickHandler = undefined) {
    NotificationRenderer.presentNotification(
      notification.title,
      {
        body: (notification.options || {}).body,
        silent: (notification.options || {}).silent,
        icon: (notification.options || {}).icon
      },
      (data) => {
        ipcRenderer.send(WB_FOCUS_APP, { })
        if (data.clickHandler) {
          data.clickHandler(notificationId)
        }
      },
      {
        notificationId: notificationId,
        clickHandler: clickHandler
      })
  }

  /**
  * Processes new notifications and prepares them for firing
  * @param mailboxState: the current mailbox state
  */
  processNewMailboxNotifications (mailboxState) {
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const now = new Date().getTime()
    const pendingNotifications = []

    // Look for notifications to send
    mailboxState.allMailboxes().forEach((mailbox) => {
      mailbox.enabledServices.forEach((service) => {
        if (!service.supportsSyncedDiffNotifications) { return }
        if (!service.showNotifications) { return }

        service.notifications.forEach((notification) => {
          const id = `${mailbox.id}:${service.type}:${notification.id}`
          if (this.__state__.sent.has(id)) { return }
          if (now - notification.timestamp > NOTIFICATION_MAX_AGE) { return }
          if (this.suppressForGrace) {
            this.__state__.sent.set(id, now)
            return
          }

          pendingNotifications.push({
            mailboxId: mailbox.id,
            serviceType: service.type,
            notification: notification
          })

          this.__state__.sent.set(id, now)
        })
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
      pendingNotifications.forEach(({ mailboxId, serviceType, notification }) => {
        NotificationRenderer.presentMailboxNotification(
          mailboxId,
          serviceType,
          notification,
          (data) => {
            ipcRenderer.send(WB_FOCUS_APP, { })
            if (data) {
              mailboxActions.changeActive(data.mailboxId, data.serviceType)
              mailboxDispatch.openItem(data.mailboxId, data.serviceType, data)
            }
          },
          mailboxState,
          settingsState
        )
      })
    }
  }
}

export default new NotificationService()
