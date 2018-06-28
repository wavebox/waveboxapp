import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { notifhistActions } from 'stores/notifhist'
import OSSettings from 'shared/Models/Settings/OSSettings'
import NotificationPlatformSupport from './NotificationPlatformSupport'
import ElectronNotificationRenderer from './ElectronNotificationRenderer'
import EnhancedNotificationRenderer from './EnhancedNotificationRenderer'
import NotificationRendererUtils from './NotificationRendererUtils'

export default class NotificationRenderer {
  /* **************************************************************************/
  // Presentation
  /* **************************************************************************/

  /**
  * Presents a html5 style notification
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  static presentNotification (title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    const settingsState = settingsStore.getState()
    const provider = NotificationPlatformSupport.supportsProvider(settingsState.os.notificationsProvider) ? settingsState.os.notificationsProvider : OSSettings.DEFAULT_NOTIFICATION_PROVIDER

    const saltedHtml5Options = {
      ...html5Options,
      silent: settingsState.os.notificationsSilent ? true : html5Options.silent
    }

    if (provider === OSSettings.NOTIFICATION_PROVIDERS.ELECTRON) {
      ElectronNotificationRenderer.presentNotification(title, saltedHtml5Options, clickHandler, clickData)
    } else if (provider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      switch (process.platform) {
        case 'darwin':
          EnhancedNotificationRenderer.presentNotificationDarwin(title, saltedHtml5Options, clickHandler, clickData)
          break
        case 'win32':
          EnhancedNotificationRenderer.presentNotificationWin32(title, saltedHtml5Options, clickHandler, clickData)
          break
        case 'linux':
          EnhancedNotificationRenderer.presentNotificationLinux(title, saltedHtml5Options, clickHandler, clickData)
          break
      }
    }
  }

  /**
  * Presents a html5 style notification for a mailbox
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceId: the type of service this is for
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  static presentHtml5MailboxNotification (mailboxId, serviceId, title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    const { enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceId, accountStore.getState(), settingsStore.getState())
    if (!enabled) { return }

    this.presentNotification(title, html5Options, clickHandler, clickData)
    notifhistActions.addNotification({
      mailboxId: mailboxId,
      serviceId: serviceId,
      title: title,
      body: html5Options.body,
      icon: html5Options.icon
    })
  }

  /**
  * Presents a mailbox notification
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceId: the id of service this is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param accountState=autoget: the current mailbox state if available
  * @param settingsState=autoget: the current settings state if available
  */
  static presentMailboxNotification (mailboxId, serviceId, notification, clickHandler, accountState = accountStore.getState(), settingsState = settingsStore.getState()) {
    const provider = NotificationPlatformSupport.supportsProvider(settingsState.os.notificationsProvider) ? settingsState.os.notificationsProvider : OSSettings.DEFAULT_NOTIFICATION_PROVIDER

    if (provider === OSSettings.NOTIFICATION_PROVIDERS.ELECTRON) {
      ElectronNotificationRenderer.presentMailboxNotification(mailboxId, serviceId, notification, clickHandler, accountState, settingsState)
    } else if (provider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      switch (process.platform) {
        case 'darwin':
          EnhancedNotificationRenderer.presentMailboxNotificationDarwin(mailboxId, serviceId, notification, clickHandler, accountState, settingsState)
          break
        case 'win32':
          EnhancedNotificationRenderer.presentMailboxNotificationWin32(mailboxId, serviceId, notification, clickHandler, accountState, settingsState)
          break
        case 'linux':
          EnhancedNotificationRenderer.presentMailboxNotificationLinux(mailboxId, serviceId, notification, clickHandler, accountState, settingsState)
          break
      }
    }

    notifhistActions.addNotification({
      mailboxId: mailboxId,
      serviceId: serviceId,
      title: NotificationRendererUtils.formattedTitle(notification),
      body: NotificationRendererUtils.formattedBody(notification),
      openPayload: notification.data
    })
  }
}
