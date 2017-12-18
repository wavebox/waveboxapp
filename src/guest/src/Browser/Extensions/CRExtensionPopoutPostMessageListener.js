import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import ExtensionLoader from './ExtensionLoader'
import { WBECRX_RELOAD_OWNER } from 'shared/ipcEvents'
import { WCRPC_CLOSE_WINDOW } from 'shared/webContentsRPC'

const privInjected = Symbol('privInjected')
const privApiKey = Symbol('privApiKey')
const privConfigs = Symbol('privConfigs')

class CRExtensionPopoutPostMessageListener {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privInjected] = false
    this[privApiKey] = uuid.v4()
    this[privConfigs] = []

    window.addEventListener('message', this.handleWindowMessage)
  }

  /**
  * Loads a new set of matches into the handler, adding to any previous
  * @param configs: an array of configs to run
  */
  addConfigs (configs) {
    this[privConfigs] = this[privConfigs].concat(configs)

    if (!this[privConfigs].length) { return }
    if (this[privInjected]) { return }
    this[privInjected] = true
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.CREXTENSION_POPOUT_WINDOW_POSTMESSAGE, this[privApiKey])
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
      if (data.apiKey !== this[privApiKey]) { return }

      if (data.type === 'wavebox-crextension-popout-postmessage') {
        if (data.hasOriginal) { return }

        const config = this[privConfigs].find((config) => {
          if (typeof (config.postMessageTarget) === 'string') {
            if (config.postMessageTarget.length && config.postMessageTarget === data.arguments[1]) {
              return true
            }
          } else if (Array.isArray(config.postMessageTarget)) {
            if (config.postMessageTarget.length) {
              const match = config.postMessageTarget.find((t) => t.length && t === data.arguments[1])
              if (match) { return true }
            }
          }

          return false
        })

        if (config) {
          (config.actions || []).forEach((action) => {
            if (action === 'reload_parent') {
              ipcRenderer.send(WBECRX_RELOAD_OWNER)
            } else if (action === 'close_window') {
              ipcRenderer.send(WCRPC_CLOSE_WINDOW)
            }
          })
        }
      }
    }
  }
}

export default CRExtensionPopoutPostMessageListener
