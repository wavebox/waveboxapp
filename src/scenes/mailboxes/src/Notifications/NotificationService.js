import { EventEmitter } from 'events'
import { NOTIFICATION_MAX_AGE, NOTIFICATION_FIRST_RUN_GRACE_MS } from 'shared/constants'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import NotificationRenderer from './NotificationRenderer'

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
      this.handleMailboxNotificationClicked
    )
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
          this.handleMailboxNotificationClicked,
          mailboxState,
          settingsState
        )
      })
    }
  }

  /**
  * Handles the notification being clicked
  * @param data: the data for the notification
  */
  handleMailboxNotificationClicked (data) {
    if (data) {
      ipcRenderer.send('focus-app', { })
      mailboxActions.changeActive(data.mailboxId, data.serviceType)
      mailboxDispatch.openItem(data.mailboxId, data.serviceType, data)
    }
  }
}

export default new NotificationService()
