const { ipcRenderer } = require('electron')
const req = require('../req')
const uuid = require('uuid')
const {
  WB_BROWSER_NOTIFICATION_CLICK,
  WB_BROWSER_NOTIFICATION_PRESENT
} = req.shared('ipcEvents')
const {
  WAVEBOX_CONTENT_IMPL_ENDPOINTS
} = req.shared('extensionApis')
const NotificationPermissionManager = req.mprocManager('NotificationPermissionManager')
const extensionLoader = require('../Extensions/extensionLoader')

class NotificationProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()

    extensionLoader.loadWaveboxGuestApi(WAVEBOX_CONTENT_IMPL_ENDPOINTS.NOTIFICATION, this.apiKey)
    window.addEventListener('message', this.handleWindowMessage.bind(this))
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
  handleWindowMessage (evt) {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }
      if (data.apiKey !== this.apiKey) { return }

      if (data.type === 'wavebox-notification-present') {
        NotificationPermissionManager.getDomainPermission(window.location.href)
          .then((permission) => {
            if (permission === 'granted') {
              ipcRenderer.sendToHost({
                type: WB_BROWSER_NOTIFICATION_PRESENT,
                notificationId: data.notificationId,
                notification: data.notification
              })
            }
          })
      } else if (data.type === 'wavebox-notification-permission-request') {
        NotificationPermissionManager.processPermissionRequest(window.location.href)
          .then((permission) => {
            setTimeout(() => {
              window.postMessage(JSON.stringify({
                type: 'wavebox-notification-permission-request-response',
                wavebox: true,
                responseId: data.responseId,
                permission: permission
              }), '*')
            }, 1000)
          })
      }
    }
  }
}

module.exports = NotificationProvider
