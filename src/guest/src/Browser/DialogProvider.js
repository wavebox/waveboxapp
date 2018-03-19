import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WCRPC_SHOW_ASYNC_MESSAGE_DIALOG } from 'shared/webContentsRPC'
import ExtensionLoader from './Extensions/ExtensionLoader'
import {
  WB_BROWSER_ALERT_PRESENT,
  WB_BROWSER_CONFIGURE_ALERT,
  WB_BROWSER_CONFIRM_PRESENT
} from 'shared/ipcEvents'

class DialogProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()
    this.asyncAlert = true

    // Workaround for runaway memory https://github.com/electron/electron/issues/11739
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.WINDOW_DIALOGS, this.apiKey, {})
    window.addEventListener('message', this.handleWindowMessage)
    ipcRenderer.on(WB_BROWSER_CONFIGURE_ALERT, this.handleConfigureAlert)
  }

  /* **************************************************************************/
  // IPC Handlers
  /* **************************************************************************/

  /**
  * Handles the alert being configured
  * @param evt: the event that fired
  * @param config: the new config
  */
  handleConfigureAlert = (evt, config) => {
    const nextAsyncAlert = !!config.async
    if (this.asyncAlert !== nextAsyncAlert) {
      this.asyncAlert = nextAsyncAlert
      window.top.postMessage(JSON.stringify({
        wavebox: true,
        type: 'wavebox-configure-alert',
        async: this.asyncAlert
      }), '*')
    }
  }

  /* **************************************************************************/
  // Guest Handlers
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

      if (data.type === 'wavebox-alert-present') {
        ipcRenderer.sendToHost({ type: WB_BROWSER_ALERT_PRESENT })
        if (this.asyncAlert) {
          ipcRenderer.send(WCRPC_SHOW_ASYNC_MESSAGE_DIALOG, {
            type: 'none',
            message: `${data.message}`,
            buttons: ['OK']
          })
        }
      } else if (data.type === 'wavebox-confirm-present') {
        ipcRenderer.sendToHost({ type: WB_BROWSER_CONFIRM_PRESENT })
      }
    }
  }
}

export default DialogProvider
