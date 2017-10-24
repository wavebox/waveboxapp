const { ipcRenderer, remote } = require('electron')
const req = require('../req')
const uuid = require('uuid')
const extensionLoader = require('./extensionLoader')
const { WBECRX_RELOAD_OWNER } = req.shared('ipcEvents')

class CRExtensionPopoutPostMessageListener {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._injected = false
    this.apiKey = uuid.v4()
    this.configs = []

    window.addEventListener('message', this.handleWindowMessage.bind(this))
  }

  /**
  * Loads a new set of matches into the handler, adding to any previous
  * @param configs: an array of configs to run
  */
  addConfigs (configs) {
    this.configs = this.configs.concat(configs)

    if (!this.configs.length) { return }
    if (this._injected) { return }
    this._injected = true
    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.CREXTENSION_POPOUT_WINDOW_POSTMESSAGE, this.apiKey)
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

      if (data.type === 'wavebox-crextension-popout-postmessage') {
        if (data.hasOriginal) { return }

        const config = this.configs.find((config) => {
          if (config.postMessageTarget && config.postMessageTarget.length) {
            if (config.postMessageTarget !== data.arguments[1]) { return false }
          }

          return true
        })

        if (config) {
          (config.actions || []).forEach((action) => {
            if (action === 'reload_parent') {
              ipcRenderer.send(WBECRX_RELOAD_OWNER)
            } else if (action === 'close_window') {
              remote.getCurrentWindow().close()
            }
          })
        }
      }
    }
  }
}

module.exports = CRExtensionPopoutPostMessageListener
