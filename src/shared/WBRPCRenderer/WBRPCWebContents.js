import { ipcRenderer } from 'electron'
import { EventEmitter } from 'events'
import {
  WBRPC_SEND_INPUT_EVENT,
  WBRPC_SEND_INPUT_EVENTS,
  WBRPC_SHOW_ASYNC_MESSAGE_DIALOG,
  WBRPC_SYNC_GET_INITIAL_HOST_URL,
  WBRPC_WC_DOM_READY,
  WBRPC_WC_DID_FRAME_FINISH_LOAD,
  WBRPC_WC_DID_FINISH_LOAD,
  WBRPC_WC_DID_ATTACH_WEBVIEW
} from '../WBRPCEvents'

class WBRPCWebContents extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    ipcRenderer.on(WBRPC_WC_DOM_READY, this._handleDomReady)
    ipcRenderer.on(WBRPC_WC_DID_FRAME_FINISH_LOAD, this._handleDidFrameFinishLoad)
    ipcRenderer.on(WBRPC_WC_DID_FINISH_LOAD, this._handleDidFinishLoad)
    ipcRenderer.on(WBRPC_WC_DID_ATTACH_WEBVIEW, this._handleDidAttachWebview)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  _handleDomReady = (evt, senderId) => {
    this.emit('dom-ready', { senderId })
  }

  _handleDidFrameFinishLoad = (evt, senderId, isMainFrame) => {
    this.emit('did-frame-finish-load', { senderId }, isMainFrame)
  }

  _handleDidFinishLoad = (evt, senderId) => {
    this.emit('did-finish-load', { senderId })
  }

  _handleDidAttachWebview = (evt, senderId, attachedId) => {
    this.emit('did-attach-webview', { senderId }, attachedId)
  }

  /* ****************************************************************************/
  // WebContent actions
  /* ****************************************************************************/

  /**
  * Sends a event to the current webcontents
  * @param events: an array of events to send
  */
  sendInputEvent (event) {
    ipcRenderer.send(WBRPC_SEND_INPUT_EVENT, event)
  }

  /**
  * Sends a set of events to the current webcontents
  * @param events: an array of events to send
  */
  sendInputEvents (events) {
    ipcRenderer.send(WBRPC_SEND_INPUT_EVENTS, events)
  }

  /* ****************************************************************************/
  // WebContent utils
  /* ****************************************************************************/

  /**
  * Shows an async dialog message
  * @param config: the config for the dialog window
  */
  showAsyncDialogMessage (config) {
    ipcRenderer.send(WBRPC_SHOW_ASYNC_MESSAGE_DIALOG, config)
  }

  /**
  * Gets the host url synchronously
  * @return the original host url
  */
  getInitialHostUrlSync () {
    return ipcRenderer.sendSync(WBRPC_SYNC_GET_INITIAL_HOST_URL)
  }
}

export default WBRPCWebContents
