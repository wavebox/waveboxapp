const { ipcRenderer } = require('electron')
const Event = require('./Core/Event')
const uuid = require('uuid')
const req = require('../../../req')
const {
  CRX_CONTEXT_MENU_CREATE_,
  CRX_CONTEXT_MENU_CLICKED_
} = req.shared('crExtensionIpcEvents')
const DispatchManager = require('./Core/DispatchManager')
const Tab = require('./Tabs/Tab')
const ProtectedRuntimeSymbols = require('./Runtime/ProtectedRuntimeSymbols')

const privExtensionId = Symbol('privExtensionId')
const privRuntime = Symbol('privRuntime')
const privClickListeners = Symbol('privClickListeners')

class ContextMenus {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/contextMenus
  * @param extensionId: the id of the extension
  * @param runtime: the current runtime
  */
  constructor (extensionId, runtime) {
    this[privExtensionId] = extensionId
    this[privRuntime] = runtime
    this[privClickListeners] = new Map()
    this.onClicked = new Event()

    ipcRenderer.on(`${CRX_CONTEXT_MENU_CLICKED_}${extensionId}`, (evt, tabId, params) => {
      const tab = new Tab(tabId)
      const clickListener = this[privClickListeners].get(params.menuItemId)
      if (clickListener) { clickListener(params, tab) }
      this.onClicked.emit(params, tab)
    })

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ACTION_MENU_TOP_LEVEL_LIMIT () { return 6 }

  /* **************************************************************************/
  // Creation
  /* **************************************************************************/

  create (properties, callback) {
    const id = properties.id || uuid.v4()
    if (properties.onclick) {
      this[privClickListeners].set(id, properties.onclick)
    }
    const createProperties = Object.assign({}, properties, { onclick: undefined })

    DispatchManager.request(
      `${CRX_CONTEXT_MENU_CREATE_}${this[privExtensionId]}`,
      [id, createProperties],
      (evt, err, response) => {
        if (err) {
          this[privRuntime][ProtectedRuntimeSymbols.protectedHandleError](err)
        }
        if (callback) {
          callback()
        }
      })
  }
}

module.exports = ContextMenus
