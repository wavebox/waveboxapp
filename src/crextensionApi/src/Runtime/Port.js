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
  * @param connectedParty: the other connected party of the connection { tabId, url, tab }
  * @param name: the port name if supplied
  */
  constructor (extensionId, portId, connectedParty, name) {
    this[privExtensionId] = extensionId
    this[privPortId] = portId
    this[privTabId] = connectedParty.tabId
    this[privName] = name
    this[privState] = {
      connected: true
    }

    this.onDisconnect = new Event()
    this.onMessage = new Event()
    this.sender = new MessageSender(extensionId, connectedParty)

    Object.freeze(this)

    ipcRenderer.on(`${CRX_PORT_DISCONNECT_}${this[privPortId]}`, () => {
      this[privState].connected = false
      ipcRenderer.removeAllListeners(`${CRX_PORT_DISCONNECT_}${this[privPortId]}`)
      this.onDisconnect.emit()
    })
    ipcRenderer.on(`${CRX_PORT_POSTMESSAGE_}${this[privPortId]}`, (evt, message) => {
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
    ipcRenderer.sendToAll(this[privTabId], `${CRX_PORT_POSTMESSAGE_}${this[privPortId]}`, message)
  }
}

export default Port
