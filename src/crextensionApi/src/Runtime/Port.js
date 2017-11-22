import { ipcRenderer } from 'electronCrx'
import Event from 'Core/Event'
import MessageSender from './MessageSender'
import {
  CRX_PORT_DISCONNECT_,
  CRX_PORT_POSTMESSAGE_
} from 'shared/crExtensionIpcEvents'

const privTabId = Symbol('privTabId')
const privPortId = Symbol('privPortId')
const privExtensionId = Symbol('privExtensionId')
const privName = Symbol('privName')
const privState = Symbol('privState')

class Port {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/runtime#type-Port
  * @param extensionId: the current extension id
  * @param portId: the id of the port
  * @param tabIdOrTab: the id or prebuilt tab of the sending tab
  * @param name: the port name if supplied
  */
  constructor (extensionId, portId, tabIdOrTab, name) {
    this[privExtensionId] = extensionId
    this[privPortId] = portId
    this[privTabId] = typeof (tabIdOrTab) === 'object' ? tabIdOrTab.id : tabIdOrTab
    this[privName] = name
    this[privState] = {
      connected: true
    }

    this.onDisconnect = new Event()
    this.onMessage = new Event()
    this.sender = new MessageSender(extensionId, tabIdOrTab)

    Object.freeze(this)

    ipcRenderer.on(`${CRX_PORT_DISCONNECT_}${this[privPortId]}`, () => {
      this[privState].connected = false
      ipcRenderer.removeAllListeners(`${CRX_PORT_DISCONNECT_}${this[privPortId]}`)
      this.onDisconnect.emit()
    })
    ipcRenderer.on(`${CRX_PORT_POSTMESSAGE_}${this[privPortId]}`, (evt, message) => {
      console.log("---------POST MESSAGE REC", this, message, this.onMessage.listeners)
      this.onMessage.emit(message, this.sender, () => {
        console.warn('chrome.runtime.port [sendResponse] is not implemented in Wavebox at this time')
      })
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get name () { return this[privName] }

  /* **************************************************************************/
  // Connection
  /* **************************************************************************/

  disconnect () {
    if (this[privState].connected === false) { return }

    ipcRenderer.sendToAll(this[privTabId], `${CRX_PORT_DISCONNECT_}${this[privPortId]}`)
    this[privState].connected = false
    ipcRenderer.removeAllListeners(`${CRX_PORT_DISCONNECT_}${this[privPortId]}`)
    this.onDisconnect.emit()
  }

  /* **************************************************************************/
  // Messaging
  /* **************************************************************************/

  postMessage (message) {
    console.log("---------POST MESSAGE", this, message)
    ipcRenderer.sendToAll(this[privTabId], `${CRX_PORT_POSTMESSAGE_}${this[privPortId]}`, message)
  }
}

/*const pxy = function(...args) {
  const port = new Port(...args)
  return new Proxy(port, {
    get: function (t, k) {
      console.log('port.' + k, t[k])
      return t[k]
    }
  })
}
export default pxy*/

export default Port
