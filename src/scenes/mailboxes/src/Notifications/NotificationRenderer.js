import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'

const MacNotification = process.platform === 'darwin' ? window.appNodeModulesRequire('node-mac-notifier') : null

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
  presentMailboxNotification (mailboxId, notification, clickHandler, mailboxState = mailboxStore.getState(), settingsState = settingsStore.getState()) {
    switch (process.platform) {
      case 'darwin': this.presentMailboxNotificationDarwin(mailboxId, notification, clickHandler, mailboxState, settingsState); break
      case 'win32': break //TODO
      case 'linux': break //TODO
    }
  }

  /* **************************************************************************/
  // Presentation: Utils
  /* **************************************************************************/

  /**
  * Formats text into a plaintext format
  * @param text: the text to format
  * @param format: the format to convert the text into
  * @return plaintext that can be used in the notifications
  */
  _formatText (text, format) {
    if (format === 'html') {
      const decoder = document.createElement('div')
      decoder.innerHTML = text
      return decoder.textContent
    } else {
      return text
    }
  }

  /**
  * Formats a title
  * @param notification: the entire notification object
  * @return the title text as a plain string
  */
  _formattedTitle (notification) {
    return this._formatText(notification.title, notification.titleFormat)
  }

  /**
  * Formats a body message
  * @param notification: the entire notification object
  * @return the body text as a plain string new line seperated
  */
  _formattedBody (notification) {
    return notification.body.map(({ content, format }) => {
      return this._formatText(content, format)
    }).join('\n')
  }

  /**
  * Gets the icon depending on mailbox settings etc
  * @param mailbox: the mailbox
  * @param mailboxState: the current mailbox state
  * @return the icon if available and should be shown or undefined
  */
  _preparedIcon (mailbox, mailboxState) {
    if (mailbox.showAvatarInNotifications) {
      return mailboxState.getResolvedAvatar(mailbox.id)
    } else {
      return undefined
    }
  }

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
    if (!settingsState.os.notificationsEnabled) { return }
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (!mailbox || !mailbox.showNotifications) { return }

    let subtitle, body
    if (notification.body.length <= 1) {
      body = this._formattedBody(notification)
    } else {
      subtitle = this._formatText(notification.body[0].content, notification.body[0].format)
      body = notification.body.slice(1).map(({ content, format }) => {
        return this._formatText(content, format)
      })
    }

    const notif = new MacNotification(this._formattedTitle(notification), {
      subtitle: subtitle,
      body: body,
      icon: this._preparedIcon(mailbox, mailboxState),
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

  presentMailboxNotificationWin32 () {
    //if (!settingsState.os.notificationsEnabled) { return }
    //const mailbox = mailboxState.getMailbox(mailboxId)
    //if (!mailbox || !mailbox.showNotifications) { return }
  }

  /* **************************************************************************/
  // Presentation: Linux
  /* **************************************************************************/

  presentMailboxNotificationLinux () {
    //if (!settingsState.os.notificationsEnabled) { return }
    //const mailbox = mailboxState.getMailbox(mailboxId)
    //if (!mailbox || !mailbox.showNotifications) { return }
  }
}

module.exports = new NotificationRenderer()
window.t=module.exports
