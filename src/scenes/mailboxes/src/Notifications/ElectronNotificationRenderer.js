import NotificationRendererUtils from './NotificationRendererUtils'

class ElectronNotificationRenderer {
  /* **************************************************************************/
  // Presentation
  /* **************************************************************************/

  /**
  * Presents a notification using the standard electron notification tooling
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotification (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    const { mailbox, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, mailboxState, settingsState)
    if (!enabled) { return }

    const windowNotification = new window.Notification(this._formattedTitle(notification), {
      body: NotificationRendererUtils.formattedBody(notification),
      silent: settingsState.os.notificationsSilent,
      data: notification.data,
      icon: NotificationRendererUtils.preparedIcon(mailbox, mailboxState)
    })
    windowNotification.onclick = (evt) => {
      if (clickHandler && evt.target && evt.target.data) {
        clickHandler(evt.target.data)
      }
    }
  }
}

module.exports = new ElectronNotificationRenderer()
