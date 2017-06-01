import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import OSSettings from 'shared/Models/Settings/OSSettings'
import NotificationPlatformSupport from './NotificationPlatformSupport'
import ElectronNotificationRenderer from './ElectronNotificationRenderer'
import EnhancedNotificationRenderer from './EnhancedNotificationRenderer'

class NotificationRenderer {
  /* **************************************************************************/
  // Presentation
  /* **************************************************************************/

  /**
  * Presents a notification
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
          //EnhancedNotificationRenderer.presentMailboxNotificationDarwin(mailboxId, notification, clickHandler, mailboxState, settingsState)
          EnhancedNotificationRenderer.presentMailboxNotificationLinux(mailboxId, notification, clickHandler, mailboxState, settingsState)
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

module.exports = NotificationRenderer

window.test = function () {
  NotificationRenderer.presentMailboxNotification(
    mailboxStore.getState().index[0],
    {
      id: ''+Math.random(),
      title: 'Test_Title',
      titleFormat: 'text',
      body: [
        { content: 'Test_body_1', format: 'text' },
        { content: 'Test_body_2', format: 'text' },
      ],
      timestamp: new Date().getTime(),
      data: { }
    },
    function () { console.log('click handler called') }
  )
}
