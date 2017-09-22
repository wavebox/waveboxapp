import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import OSSettings from 'shared/Models/Settings/OSSettings'
import NotificationPlatformSupport from './NotificationPlatformSupport'
import ElectronNotificationRenderer from './ElectronNotificationRenderer'
import EnhancedNotificationRenderer from './EnhancedNotificationRenderer'

export default class NotificationRenderer {
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
  * Presents a mailbox notification
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState=autoget: the current mailbox state if available
  * @param settingsState=autoget: the current settings state if available
  */
  static presentMailboxNotification (mailboxId, notification, clickHandler, mailboxState = mailboxStore.getState(), settingsState = settingsStore.getState()) {
    const provider = NotificationPlatformSupport.supportsProvider(settingsState.os.notificationsProvider) ? settingsState.os.notificationsProvider : OSSettings.DEFAULT_NOTIFICATION_PROVIDER

    if (provider === OSSettings.NOTIFICATION_PROVIDERS.ELECTRON) {
      ElectronNotificationRenderer.presentMailboxNotification(mailboxId, notification, clickHandler, mailboxState, settingsState)
    } else if (provider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      switch (process.platform) {
        case 'darwin':
          EnhancedNotificationRenderer.presentMailboxNotificationDarwin(mailboxId, notification, clickHandler, mailboxState, settingsState)
          break
        case 'win32':
          EnhancedNotificationRenderer.presentMailboxNotificationWin32(mailboxId, notification, clickHandler, mailboxState, settingsState)
          break
        case 'linux':
          EnhancedNotificationRenderer.presentMailboxNotificationLinux(mailboxId, notification, clickHandler, mailboxState, settingsState)
          break
      }
    }
  }
}
