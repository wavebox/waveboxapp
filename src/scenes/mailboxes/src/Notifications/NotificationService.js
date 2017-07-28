import { EventEmitter } from 'events'
import { NOTIFICATION_MAX_AGE, NOTIFICATION_FIRST_RUN_GRACE_MS } from 'shared/constants'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import NotificationRenderer from './NotificationRenderer'
import { WB_FOCUS_APP } from 'shared/ipcEvents'

const { ipcRenderer } = window.nativeRequire('electron')

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
  * @param notification: the notification to push
  */
  processPushedMailboxNotification (mailboxId, notification) {
    NotificationRenderer.presentMailboxNotification(
      mailboxId,
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
  * @param notification: the notification to push
  * @param clickHandler: the click handler to call
  */
  processHandledMailboxNotification (mailboxId, notification, clickHandler) {
    NotificationRenderer.presentMailboxNotification(
      mailboxId,
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
      if (!mailbox.showNotifications) { return }

      mailbox.notifications.forEach((notification) => {
        const id = `${mailbox.id}:${notification.id}`
        if (this.__state__.sent.has(id)) { return }
        if (now - notification.timestamp > NOTIFICATION_MAX_AGE) { return }
        if (this.suppressForGrace) {
          this.__state__.sent.set(id, now)
          return
        }

        pendingNotifications.push({
          mailboxId: mailbox.id,
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
      pendingNotifications.forEach(({ mailboxId, notification }) => {
        NotificationRenderer.presentMailboxNotification(
          mailboxId,
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
