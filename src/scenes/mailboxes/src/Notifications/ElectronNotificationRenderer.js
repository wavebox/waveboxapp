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
    if (NotificationRendererUtils.areNotificationsMuted()) { return }

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
  * @param serviceId: the id of service the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param accountState: the current account state
  * @param settingsState: the current settings state
  */
  presentMailboxNotification (mailboxId, serviceId, notification, clickHandler, accountState, settingsState) {
    if (NotificationRendererUtils.areNotificationsMuted(settingsState)) { return }
    const { mailbox, service, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceId, accountState, settingsState)
    if (!enabled) { return }

    const windowNotification = new window.Notification(NotificationRendererUtils.formattedTitle(notification), {
      body: NotificationRendererUtils.formattedBody(notification),
      silent: settingsState.os.notificationsSilent,
      data: notification.data,
      icon: NotificationRendererUtils.preparedServiceIcon(mailbox, service, accountState)
    })
    windowNotification.onclick = (evt) => {
      if (clickHandler && evt.target && evt.target.data) {
        clickHandler(evt.target.data)
      }
    }
  }
}

export default new ElectronNotificationRenderer()
