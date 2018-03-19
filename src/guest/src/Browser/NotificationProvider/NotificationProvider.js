import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_BROWSER_NOTIFICATION_CLICK, WB_BROWSER_NOTIFICATION_PRESENT } from 'shared/ipcEvents'
import { DEFAULT_HTML5_NOTIFICATION_OPTIONS } from 'shared/constants'
import NotificationPermissionManager from './NotificationPermissionManager'
import ExtensionLoader from '../Extensions/ExtensionLoader'

class NotificationProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()
    this.permissionManager = new NotificationPermissionManager()

    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.NOTIFICATION, this.apiKey, {
      permission: this.permissionManager.getDomainPermission()
    })
    window.addEventListener('message', this.handleWindowMessage)
    ipcRenderer.on(WB_BROWSER_NOTIFICATION_CLICK, (evt, data) => {
      window.postMessage(JSON.stringify({
        type: 'wavebox-notification-clicked',
        wavebox: true,
        notificationId: data.notificationId
      }), '*')
    })
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Handles a new window message
  * @param evt: the event that fired
  */
  handleWindowMessage = (evt) => {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }
      if (data.apiKey !== this.apiKey) { return }

      if (data.type === 'wavebox-notification-present') {
        const permission = this.permissionManager.getDomainPermission()
        if (permission === 'granted') {
          ipcRenderer.sendToHost({
            type: WB_BROWSER_NOTIFICATION_PRESENT,
            notificationId: data.notificationId,
            notification: {
              title: data.notification.title,
              options: Object.assign(
                DEFAULT_HTML5_NOTIFICATION_OPTIONS[window.location.host] || {},
                data.notification.options
              )
            }
          })
        }
      } else if (data.type === 'wavebox-notification-permission-request') {
        const newPermission = this.permissionManager.processPermissionRequest()
        setTimeout(() => {
          window.postMessage(JSON.stringify({
            type: 'wavebox-notification-permission-request-response',
            wavebox: true,
            responseId: data.responseId,
            permission: newPermission
          }), '*')
        }, 1000)
      }
    }
  }
}

export default NotificationProvider
