import { EventEmitter } from 'events'
import { NOTIFICATION_MAX_AGE, NOTIFICATION_FIRST_RUN_GRACE_MS } from 'shared/constants'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
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
    this.processNewNotifications(mailboxState)
  }

  /* **************************************************************************/
  // Notification Processors
  /* **************************************************************************/

  /**
  * Processes new notifications and prepares them for firing
  * @param mailboxState: the current mailbox state
  */
  processNewNotifications (mailboxState) {
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
          ...notification,
          icon: mailboxState.getResolvedAvatar(mailbox.id)
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
      this.showNotifications(pendingNotifications)
    }
  }

  /* **************************************************************************/
  // Notification Rendering
  /* **************************************************************************/

  /**
  * Formats text into a plaintext format
  * @param text: the text to format
  * @param format: the format to convert the text into
  * @return plaintext that can be used in the notifications
  */
  formatText (text, format) {
    if (format === 'html') {
      const decoder = document.createElement('div')
      decoder.innerHTML = text
      return decoder.textContent
    } else {
      return text
    }
  }

  /**
  * Shows a single notification
  * @param notification: the notification to show
  * @return the notification object
  */
  showNotification (notification) {
    return this.showNotifications([notification])[0]
  }

  /**
  * Shows a set of notifications
  * @param notifications: the notifications to show
  * @return the notification objects
  */
  showNotifications (notifications) {
    const settingsState = settingsStore.getState()
    if (!settingsState.os.notificationsEnabled) { return }

    const silent = settingsState.os.notificationsSilent
    return notifications.map((notification) => {
      const title = this.formatText(notification.title, notification.titleFormat)
      const body = notification.body.map(({ content, format }) => {
        return this.formatText(content, format)
      }).join('\n')
      const windowNotification = new window.Notification(title, {
        body: body,
        silent: silent,
        data: notification.data,
        icon: notification.icon
      })
      windowNotification.onclick = this.handleNotificationClicked
      return windowNotification
    })
  }

  /**
  * Handles a notification being clicked on
  * @param evt: the event that fired
  */
  handleNotificationClicked (evt) {
    if (evt.target && evt.target.data) {
      const data = evt.target.data
      ipcRenderer.send('focus-app', { })
      mailboxActions.changeActive(data.mailboxId, data.serviceType)
      mailboxDispatch.openItem(data.mailboxId, data.serviceType, data)
    }
  }
}

export default new NotificationService()
