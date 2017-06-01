import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { enhancedSupportWin32 } from './NotificationPlatformSupport'
import stringHash from 'string-hash'

const pkg = window.appPackage()
const os = window.nativeRequire('os')
const path = window.nativeRequire('path')
const fs = window.nativeRequire('fs-extra')
const MacNotification = process.platform === 'darwin' ? window.appNodeModulesRequire('node-mac-notifier') : null
const Win32Notification = enhancedSupportWin32 ? window.appNodeModulesRequire('electron-windows-notifications') : null

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
      case 'win32': this.presentMailboxNotificationWin32(mailboxId, notification, clickHandler, mailboxState, settingsState); break
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

  /**
  * Gets the icon depending on mailbox settings etc and stores it locally on disk
  * @param mailbox: the mailbox
  * @param mailboxState: the current mailboxState
  * @return an always resolved promise with the local file url of the icon or undefined on failure etc
  */
  _preparedIconWin32 (mailbox, mailboxState) {
    const icon = this._preparedIcon(mailbox, mailboxState)
    if (!icon) {
      return Promise.resolve(undefined)
    } else {
      console.log("icon=", icon)
      if (icon.startsWith('http://') || icon.startsWith('https://')) {
        return Promise.resolve()
          .then(() => fetch(icon)) // The browser should cache this so we wont be hitting the network too heavily
          .then((res) => {
            console.log("ok?", res.ok)
            return res.ok ? Promise.resolve(res) : Promis.reject(res)
          })
          .then((res) => res.blob())
          .then((blob) => {
            console.log("got to blob")
            return new Promise((resolve, reject) => {
              const reader = new window.FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
          })
          .then((b64Icon) => {
            console.log("Got b64 icon")
            return this._resolveOrWriteTempBase64Icon(mailbox.id, b64Icon)
          })
          .catch(() => Promise.resolve(undefined))
      } else if (icon.startsWith('data:image/')) {
        return this._resolveOrWriteTempBase64Icon(mailbox.id, icon)
      } else {
        return Promise.resolve(undefined)
      }
    }
  }

  /**
  * Checks to see if a base64 icon exists on disk or not and if not writes it to disk
  * @param mailboxId: the id of the mailbox
  * @param icon: the base64 icon
  * @return promise, always resolved, with path as the argument or undefined on failure
  */
  _resolveOrWriteTempBase64Icon (mailboxId, icon) {
    return new Promise((resolve, reject) => {
      const match = icon.match(/^data:image\/(\w+);base64,([\s\S]+)/)
      const matchMapping = {
        jpeg: 'jpg'
      }
console.log("here0")
      if (!match) {
        resolve(undefined)
        return
      }
console.log("here1")

      const ext = matchMapping[match[1]] || match[1]
      const data = match[2]
      const imageHash = `wavebox_${mailboxId.replace(/-/g, '')}_${stringHash(icon)}.${ext}`
      const outputPath = path.join(os.tmpdir(), imageHash)

console.log("Out", outputPath)
      Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            fs.access(outputPath, fs.constants.R_OK, (err) => {
              if (err) {
                console.log("here2", err)
                reject(err)
              } else {
                console.log("here3")
                resolve()
              }
            })
          })
        })
        .then(
          () => resolve(outputPath),
          (e) => {
            Promise.resolve()
              .then(() => fs.writeFile(outputPath, data, 'base64'))
              .then(
                () => {
                  console.log("OK")
                  resolve(outputPath)
                },
                (err) => {
                  console.log("ERR", err)
                  resolve(undefined)
                }
              )
          }
        )
    })
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

  /**
  * Presents a notification on win32
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationWin32 (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    if (!Win32Notification || !Win32Notification.ToastNotification) { // Windows 7 -> 8.1
      this.presentElectronNotification(mailboxId, notification, clickHandler, mailboxState, settingsState)
      return
    }

    if (!settingsState.os.notificationsEnabled) { return }
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (!mailbox || !mailbox.showNotifications) { return }



    this._preparedIconWin32(mailbox, mailboxState)
      .then((icon) => {
        const notif = new Win32Notification.ToastNotification({
          appId: pkg.name,
          template: [
            '<toast>', //TODO:https://docs.microsoft.com/en-us/windows/uwp/controls-and-patterns/tiles-and-notifications-adaptive-interactive-toasts
              '<visual>',
                '<binding template="ToastGeneric">',
                  '<text id="1" hint-maxLines="1">%s</text>',
                  '<text id="2">%s</text>',
                  '<image placement="AppLogoOverride" hint-crop="circle" id="3" src="%s" />',
                '</binding>',
              '</visual>',
              `<audio src="ms-winsoundevent:Notification.Default" silent="${settingsState.os.notificationsSilent ? 'true' : 'false'}" />`,
            '</toast>'
          ].join(''),
          strings: [
            this._formattedTitle(notification),
            this._formattedBody(notification),
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
    //TODO audio: https://docs.microsoft.com/en-us/uwp/schemas/tiles/toastschema/element-audio
  }

  /**
  * Presents a plain text notification on windows
  * @param mailbox: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  /*_presentMailboxNotificationWin32Text (mailbox, notification, clickHandler, mailboxState, settingsState) {
    const notif = new Win32Notification.ToastNotification({
      appId: pkg.name,
      template: WINDOWS_TEMPLATES.mailboxText,
      strings: [
        this._formattedTitle(notification),
        this._formattedBody(notification)
      ]
    })
    notif.on('activated', () => {
      console.log("activated")
    })
    notif.show()
  }*/

  /* **************************************************************************/
  // Presentation: Linux
  /* **************************************************************************/

  presentMailboxNotificationLinux () {
    //if (!settingsState.os.notificationsEnabled) { return }
    //const mailbox = mailboxState.getMailbox(mailboxId)
    //if (!mailbox || !mailbox.showNotifications) { return }
  }

  /* **************************************************************************/
  // Presentation: Electron
  /* **************************************************************************/

  /**
  * Presents a notification using the standard electron notification tooling
  * @param mailboxId: the id of the mailbox the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentElectronNotification (mailboxId, notification, clickHandler, mailboxState, settingsState) {
    if (!settingsState.os.notificationsEnabled) { return }
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (!mailbox || !mailbox.showNotifications) { return }

    const title = this.formatText(notification.title, notification.titleFormat)
    const body = notification.body.map(({ content, format }) => {
      return this.formatText(content, format)
    }).join('\n')
    const windowNotification = new window.Notification(this._formattedTitle(notification), {
      body: this._formattedBody(notification),
      silent: settingsState.os.notificationsSilent,
      data: notification.data,
      icon: this._preparedIcon(mailbox, mailboxState)
    })
    windowNotification.onclick = (evt) => {
      if (clickHandler && evt.target && evt.target.data) {
        clickHandler(evt.target.data)
      }
    }
  }
}

module.exports = new NotificationRenderer()
window.t=module.exports
window.ttt = mailboxStore.getState().index[0]
window.tt = function () {
 Win32Notification.setLogger(function (a,b,c) { console.log('W32N', a,b,c) } )
  module.exports.presentMailboxNotification(
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
