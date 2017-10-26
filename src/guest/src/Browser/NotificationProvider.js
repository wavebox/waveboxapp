const { ipcRenderer } = require('electron')
const req = require('../req')
const uuid = require('uuid')
const {
  WB_BROWSER_NOTIFICATION_CLICK,
  WB_BROWSER_NOTIFICATION_PRESENT
} = req.shared('ipcEvents')
const NotificationPermissionManager = require('./NotificationPermissionManager')
const extensionLoader = require('../Extensions/extensionLoader')
const GuestHost = require('../GuestHost')

class NotificationProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()
    this.permissionManager = new NotificationPermissionManager(req.runtimePaths().NOTIFICATION_PERMISSION_PATH)

    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.NOTIFICATION, this.apiKey, {
      permission: this.permissionManager.getDomainPermissionSync(GuestHost.url)
    })
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
        this.permissionManager.getDomainPermission(window.location.href)
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
        this.permissionManager.processPermissionRequest(window.location.href)
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
