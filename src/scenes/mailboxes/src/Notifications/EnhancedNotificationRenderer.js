import NotificationRendererUtils from './NotificationRendererUtils'
import { DEFAULT_NOTIFICATION_SOUND } from 'shared/Notifications'
import Win32Notification from './Win32NotificationLossy'
import pkg from 'package.json'
import uuid from 'uuid'
import { settingsStore } from 'stores/settings'
import { ipcRenderer } from 'electron'
import {
  WB_LIN_NOTIF_CLICK,
  WB_LIN_NOTIF_PRESENT
} from 'shared/ipcEvents'

const MacNotification = process.platform === 'darwin' ? window.appNodeModulesRequire('node-mac-notifier') : null

class EnhancedNotificationRenderer {
  /* **************************************************************************/
  // Presentation: Darwin
  /* **************************************************************************/

  /**
  * Presents a notification on osx
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  presentNotificationDarwin (title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    if (NotificationRendererUtils.areNotificationsMuted()) { return }

    const notif = new MacNotification(title, {
      body: html5Options.body,
      icon: html5Options.icon,
      soundName: html5Options.silent ? undefined : (settingsStore.getState().os.notificationsSound || DEFAULT_NOTIFICATION_SOUND),
      bundleId: pkg.appConfig.osxAppBundleId
    })
    notif.addEventListener('click', () => {
      if (clickHandler) {
        clickHandler(clickData)
      }
    })
  }

  /**
  * Presents a mailbox notification on osx
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationDarwin (mailboxId, serviceType, notification, clickHandler, mailboxState, settingsState) {
    if (NotificationRendererUtils.areNotificationsMuted(settingsState)) { return }
    const { mailbox, service, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceType, mailboxState, settingsState)
    if (!enabled) { return }

    let subtitle, body
    if (Array.isArray(notification.body) && notification.body.length >= 2) {
      subtitle = NotificationRendererUtils.formatText(notification.body[0].content, notification.body[0].format)
      body = notification.body.slice(1).map(({ content, format }) => {
        return NotificationRendererUtils.formatText(content, format)
      }).join('\n')
    } else {
      body = NotificationRendererUtils.formattedBody(notification)
    }

    const notif = new MacNotification(NotificationRendererUtils.formattedTitle(notification), {
      subtitle: subtitle,
      body: body,
      icon: NotificationRendererUtils.preparedServiceIcon(mailbox, service, mailboxState),
      soundName: NotificationRendererUtils.preparedServiceSound(mailbox, service, settingsState),
      bundleId: pkg.appConfig.osxAppBundleId
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
  * Presents a notification on osx
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  presentNotificationWin32 (title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    if (NotificationRendererUtils.areNotificationsMuted()) { return }

    const sound = settingsStore.getState().os.notificationsSound || DEFAULT_NOTIFICATION_SOUND
    NotificationRendererUtils.preparedIconWin32(html5Options.icon)
      .then((icon) => {
        const notif = new Win32Notification.ToastNotification({
          appId: pkg.name,
          template: [
            /* eslint-disable */
            '<toast>',
              '<visual>',
                '<binding template="ToastGeneric">',
                  '<text id="1" hint-maxLines="1">%s</text>',
                  '<text id="2">%s</text>',
                  icon ? '<image placement="AppLogoOverride" id="3" src="%s" />' : undefined,
                '</binding>',
              '</visual>',
              `<audio src="${sound}" silent="${html5Options.silent ? 'true' : 'false'}" />`,
            '</toast>'
            /* eslint-enable */
          ].filter((l) => !!l).join(''),
          strings: [
            title,
            html5Options.body
          ].concat(icon ? [icon] : [])
        })
        notif.on('activated', () => {
          if (clickHandler) {
            clickHandler(clickData)
          }
        })
        notif.show()
      })
  }

  /**
  * Presents a mailbox notification on win32
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationWin32 (mailboxId, serviceType, notification, clickHandler, mailboxState, settingsState) {
    if (NotificationRendererUtils.areNotificationsMuted(settingsState)) { return }
    const { mailbox, service, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceType, mailboxState, settingsState)
    if (!enabled) { return }

    NotificationRendererUtils.preparedServiceIconWin32(mailbox, service, mailboxState)
      .then((icon) => {
        const sound = NotificationRendererUtils.preparedServiceSound(mailbox, service, settingsState)
        const notif = new Win32Notification.ToastNotification({
          appId: pkg.name,
          template: [
            /* eslint-disable */
            '<toast launch="launchApp">',
              '<visual>',
                '<binding template="ToastGeneric">',
                  '<text id="1" hint-maxLines="1">%s</text>',
                  '<text id="2">%s</text>',
                  icon ? '<image placement="AppLogoOverride" hint-crop="circle" id="3" src="%s" />' : undefined,
                '</binding>',
              '</visual>',
              `<audio src="${sound || DEFAULT_NOTIFICATION_SOUND}" silent="${sound === undefined ? 'true' : 'false'}" />`,
            '</toast>'
            /* eslint-enable */
          ].filter((l) => !!l).join(''),
          strings: [
            NotificationRendererUtils.formattedTitle(notification),
            NotificationRendererUtils.formattedBody(notification)
          ].concat(icon ? [icon] : [])
        })
        notif.on('activated', () => {
          if (clickHandler) {
            clickHandler(notification.data)
          }
        })
        notif.show()
      })
  }

  /* **************************************************************************/
  // Presentation: Linux
  /* **************************************************************************/

  /**
  * Presents a notification on linux
  * @param title: the title of the notification
  * @param html5Options = {}: the notification info to present in html5 format
  * @param clickHandler=undefined: the handler to call on click or undefined
  * @param clickData={}: the data to provide to the click handler
  */
  presentNotificationLinux (title, html5Options = {}, clickHandler = undefined, clickData = {}) {
    if (NotificationRendererUtils.areNotificationsMuted()) { return }

    const sound = settingsStore.getState().os.notificationsSound || DEFAULT_NOTIFICATION_SOUND
    this._showLinuxNotification({
      title: title,
      body: html5Options.body,
      icon: html5Options.icon,
      sound: html5Options.silent ? undefined : sound
    }, clickHandler, clickData)
  }

  /**
  * Presents a notification on win32
  * @param mailboxId: the id of the mailbox the notification is for
  * @param serviceType: the type of service the notification is for
  * @param notification: the notification info to present
  * @param clickHandler: the handler to call on click
  * @param mailboxState: the current mailbox state
  * @param settingsState: the current settings state
  */
  presentMailboxNotificationLinux (mailboxId, serviceType, notification, clickHandler, mailboxState, settingsState) {
    if (NotificationRendererUtils.areNotificationsMuted(settingsState)) { return }
    const { mailbox, service, enabled } = NotificationRendererUtils.checkConfigAndFetchMailbox(mailboxId, serviceType, mailboxState, settingsState)
    if (!enabled) { return }

    this._showLinuxNotification({
      title: NotificationRendererUtils.formattedTitle(notification),
      body: NotificationRendererUtils.formattedBody(notification),
      icon: NotificationRendererUtils.preparedServiceIcon(mailbox, service, mailboxState),
      sound: NotificationRendererUtils.preparedServiceSound(mailbox, service, settingsState)
    }, clickHandler, notification.data)
  }

  /**
  * Handles the heavy lifting of showing the linux notification
  * @param options: the notification options
  * @param clickHandler: the click handler
  * @param clickData: the click data
  */
  _showLinuxNotification (options, clickHandler, clickData) {
    const id = uuid.v4()
    if (clickHandler) {
      let expirer = null
      const callbackListener = (evt, callbackId) => {
        if (callbackId === id) {
          clearTimeout(expirer)
          ipcRenderer.removeListener(WB_LIN_NOTIF_CLICK, callbackListener)
          clickHandler(clickData)
        }
      }
      expirer = setTimeout(() => {
        ipcRenderer.removeListener(WB_LIN_NOTIF_CLICK, callbackListener)
      }, 60000)

      ipcRenderer.on(WB_LIN_NOTIF_CLICK, callbackListener)
    }
    ipcRenderer.send(WB_LIN_NOTIF_PRESENT, id, options)
  }
}

export default new EnhancedNotificationRenderer()
