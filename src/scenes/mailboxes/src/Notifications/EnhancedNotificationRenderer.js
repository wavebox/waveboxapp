import NotificationRendererUtils from './NotificationRendererUtils'
import EnhancedNotificationWindowLinux from './EnhancedNotificationWindowLinux'

const { BrowserWindow } = window.nativeRequire('electron').remote
const path = window.nativeRequire('path')
const pkg = window.appPackage()
const MacNotification = process.platform === 'darwin' ? window.appNodeModulesRequire('node-mac-notifier') : null
const Win32Notification = process.platform === 'win32' ? window.appNodeModulesRequire('electron-windows-notifications') : null

class EnhancedNotificationRenderer {
  /* **************************************************************************/
  // Presentation: Darwin
  /* **************************************************************************/

  /**
  * Presents a notification on osx
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationDarwin (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    const { mailbox, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, mailboxState, settingsState)
    if (!enabled) { return }

    let subtitle, body
    if (notification.body.length <= 1) {
      body = NotificationRendererUtils.formattedBody(notification)
    } else {
      subtitle = NotificationRendererUtils.formatText(notification.body[0].content, notification.body[0].format)
      body = notification.body.slice(1).map(({ content, format }) => {
        return NotificationRendererUtils.formatText(content, format)
      }).join('\n')
    }

    const notif = new MacNotification(NotificationRendererUtils.formattedTitle(notification), {
      subtitle: subtitle,
      body: body,
      icon: NotificationRendererUtils.preparedIcon(mailbox, mailboxState),
      soundName: settingsState.os.notificationsSilent ? undefined : 'default'
    })
    notif.addEventListener('click', () => {
      if (clickHandler) {
        clickHandler(notification.data)
      }
    })
  }

  /* **************************************************************************/
  // Presentation: Win32
  /* **************************************************************************/

  /**
  * Presents a notification on win32
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationWin32 (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    const { mailbox, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, mailboxState, settingsState)
    if (!enabled) { return }

    NotificationRendererUtils.preparedIconWin32(mailbox, mailboxState)
      .then((icon) => {
        const notif = new Win32Notification.ToastNotification({
          appId: pkg.name,
          template: [
            /*eslint-disable */
            '<toast>',
              '<visual>',
                '<binding template="ToastGeneric">',
                  '<text id="1" hint-maxLines="1">%s</text>',
                  '<text id="2">%s</text>',
                  '<image placement="AppLogoOverride" hint-crop="circle" id="3" src="%s" />',
                '</binding>',
              '</visual>',
              `<audio src="ms-winsoundevent:Notification.Default" silent="${settingsState.os.notificationsSilent ? 'true' : 'false'}" />`,
            '</toast>'
            /*eslint-enable */
          ].join(''),
          strings: [
            NotificationRendererUtils.formattedTitle(notification),
            NotificationRendererUtils.formattedBody(notification),
            icon
          ]
        })
        notif.on('activated', () => {
          if (clickHandler) {
            clickHandler(notification.data)
          }
        })
        notif.show()
      })
    //TODO background linking https://docs.microsoft.com/en-us/windows/uwp/controls-and-patterns/tiles-and-notifications-adaptive-interactive-toasts
    //TODO audio: https://docs.microsoft.com/en-us/uwp/schemas/tiles/toastschema/element-audio
  }

  /* **************************************************************************/
  // Presentation: Linux
  /* **************************************************************************/

  /**
  * Presents a notification on win32
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationLinux (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    const { mailbox, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, mailboxState, settingsState)
    if (!enabled) { return }

    EnhancedNotificationWindowLinux.showNotification({
      title: NotificationRendererUtils.formattedTitle(notification),
      body: NotificationRendererUtils.formattedBody(notification),
      icon: NotificationRendererUtils.preparedIcon(mailbox, mailboxState)
    }, clickHandler, notification.data)
  }
}

module.exports = new EnhancedNotificationRenderer()
