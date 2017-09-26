import NotificationRendererUtils from './NotificationRendererUtils'

class ElectronNotificationRenderer {
  /* **************************************************************************/
  // Presentation
  /* **************************************************************************/

  /**
  * Presents a notification on osx
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  presentNotification (title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    const notification = new window.Notification(title, html5Options)
    notification.onclick = function () {
      if (clickHandler) {
        clickHandler(clickData)
      }
    }
  }

  /**
  * Presents a mailbox notification using the standard electron notification tooling
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotification (mailboxId, serviceType, notification, clickHandler, mailboxState, settingsState) {
    const { mailbox, service, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceType, mailboxState, settingsState)
    if (!enabled) { return }

    const windowNotification = new window.Notification(NotificationRendererUtils.formattedTitle(notification), {
      body: NotificationRendererUtils.formattedBody(notification),
      silent: settingsState.os.notificationsSilent,
      data: notification.data,
      icon: NotificationRendererUtils.preparedServiceIcon(mailbox, service, mailboxState)
    })
    windowNotification.onclick = (evt) => {
      if (clickHandler && evt.target && evt.target.data) {
        clickHandler(evt.target.data)
      }
    }
  }
}

export default new ElectronNotificationRenderer()
