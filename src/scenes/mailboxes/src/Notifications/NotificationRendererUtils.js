import stringHash from 'string-hash'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import Resolver from 'Runtime/Resolver'
import settingsStore from 'stores/settings/settingsStore'

export default class NotificationRendererUtils {
  /* **************************************************************************/
  // OS Settings
  /* **************************************************************************/

  /**
  * Checks if notifications are muted
  * @param settingsState=autoget: the settings state
  * @return true if notifications are muted, false otherwise
  */
  static areNotificationsMuted (settingsState = settingsStore.getState()) {
    return settingsState.os.notificationsMuted
  }

  /* **************************************************************************/
  // Config utils
  /* **************************************************************************/

  /**
  * Checks the config to see if notifications are enabled and gets the mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of service
  * @param accountState: the current account state
  * @param settingsState: the current settings state
  * @return { mailbox, service, enabled }
  */
  static checkConfigAndFetchMailbox (mailboxId, serviceId, accountState, settingsState) {
    if (!settingsState.os.notificationsEnabled) {
      return { mailbox: undefined, service: undefined, enabled: false }
    }

    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const showNotifications = service ? service.showNotifications : false
    return { mailbox: mailbox, service: service, enabled: showNotifications }
  }

  /* **************************************************************************/
  // Text Formatting
  /* **************************************************************************/

  /**
  * Formats text into a plaintext format
  * @param text: the text to format
  * @param format = undefined: the format to convert the text into
  * @return plaintext that can be used in the notifications
  */
  static formatText (text, format = undefined) {
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
  static formattedTitle (notification) {
    return this.formatText(notification.title, notification.titleFormat)
  }

  /**
  * Formats a body message
  * @param notification: the entire notification object
  * @return the body text as a plain string new line seperated
  */
  static formattedBody (notification) {
    if (Array.isArray(notification.body)) {
      return notification.body.map(({ content, format }) => {
        return this.formatText(content, format)
      }).join('\n')
    } else {
      return this.formatText(notification.body)
    }
  }

  /* **************************************************************************/
  // Sound
  /* **************************************************************************/

  /**
  * Gets the sound file for the mailbox taking into account settings
  * @param mailbox: the mailbox to get the sound for
  * @param service: the service to get the sound for
  * @param settingsState: the current settings state
  * @return the mailbox sound, or undefined to indicate silence
  */
  static preparedServiceSound (mailbox, service, settingsState) {
    if (settingsState.os.notificationsSilent) { return undefined }

    return service.notificationsSound || this.preparedSound(settingsState)
  }

  /**
  * Gets the sound file taking into account settings
  * @param settingsState: the current settings state
  * @return the mailbox sound, or undefined to indicate silence
  */
  static preparedSound (settingsState) {
    if (settingsState.os.notificationsSilent) { return undefined }

    return settingsState.os.notificationsSound
  }

  /* **************************************************************************/
  // Icons: Mailbox
  /* **************************************************************************/

  /**
  * Gets the icon depending on mailbox settings etc
  * @param mailbox: the mailbox
  * @param service: the service
  * @param accountState: the current mailbox state
  * @return the icon if available and should be shown or undefined
  */
  static preparedServiceIcon (mailbox, service, accountState) {
    if (service.showAvatarInNotifications) {
      const avatar = accountState.getServiceAvatarConfig(service.id)
      if (avatar.hasAvatar) {
        return avatar.resolveAvatar((i) => Resolver.image(i))
      } else if (avatar.hasServiceIcon) {
        return avatar.resolveServiceIcon((i) => Resolver.image(i))
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  /**
  * Gets the icon depending on mailbox settings etc and stores it locally on disk
  * @param mailbox: the mailbox
  * @param service: the service
  * @param accountState: the current accountState
  * @return an always resolved promise with the local file url of the icon or undefined on failure etc
  */
  static preparedServiceIconWin32 (mailbox, service, accountState) {
    return this.preparedIconWin32(
      this.preparedServiceIcon(mailbox, service, accountState),
      mailbox.id.replace(/-/g, '')
    )
  }

  /* **************************************************************************/
  // Icons: Mailbox
  /* **************************************************************************/

  /**
  * Gets the icon depending on mailbox settings etc and stores it locally on disk
  * @param icon: the icon as http or base64 format
  * @param hashPrefix="auto": a prefix to prepend to the hash to reduce collisions. Needs to be file safe
  * @return an always resolved promise with the local file url of the icon or undefined on failure etc
  */
  static preparedIconWin32 (icon, hashPrefix = 'auto') {
    if (!icon) {
      return Promise.resolve(undefined)
    } else {
      if (icon.startsWith('http://') || icon.startsWith('https://')) {
        return Promise.resolve()
          .then(() => window.fetch(icon)) // The browser should cache this so we wont be hitting the network too heavily
          .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
          .then((res) => res.blob())
          .then((blob) => {
            return new Promise((resolve, reject) => {
              const reader = new window.FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
          })
          .then((b64Icon) => this.resolveOrWriteTempBase64Icon(b64Icon))
          .catch(() => Promise.resolve(undefined))
      } else if (icon.startsWith('data:image/')) {
        return this.resolveOrWriteTempBase64Icon(icon)
      } else {
        return Promise.resolve(undefined)
      }
    }
  }

  /**
  * Checks to see if a base64 icon exists on disk or not and if not writes it to disk
  * @param icon: the base64 icon
  * @param hashPrefix="auto": a prefix to prepend to the hash to reduce collisions. Needs to be file safe
  * @return promise, always resolved, with path as the argument or undefined on failure
  */
  static resolveOrWriteTempBase64Icon (icon, hashPrefix = 'auto') {
    return new Promise((resolve, reject) => {
      const match = icon.match(/^data:image\/(\w+);base64,([\s\S]+)/)
      const matchMapping = {
        jpeg: 'jpg'
      }

      if (!match) {
        resolve(undefined)
        return
      }

      const ext = matchMapping[match[1]] || match[1]
      const data = match[2]
      const imageHash = `wavebox_${hashPrefix}_${stringHash(icon)}.${ext}`
      const outputPath = path.join(os.tmpdir(), imageHash)

      Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            fs.access(outputPath, fs.constants.R_OK, (err) => {
              if (err) {
                reject(err)
              } else {
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
                () => resolve(outputPath),
                () => resolve(undefined)
              )
          }
        )
    })
  }
}
