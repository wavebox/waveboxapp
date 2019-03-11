import { ipcRenderer } from 'electron'
import { EventEmitter } from 'events'
import {
  WBRPC_WC_SEND_INPUT_EVENT,
  WBRPC_WC_SEND_INPUT_EVENTS,
  WBRPC_WC_GO_BACK,
  WBRPC_WC_GO_FORWARD,
  WBRPC_WC_STOP,
  WBRPC_WC_RELOAD,
  WBRPC_WC_LOAD_URL,
  WBRPC_WC_CAN_GO_BACK_SYNC,
  WBRPC_WC_CAN_GO_FORWARD_SYNC,
  WBRPC_WC_GET_URL_SYNC,
  WBRPC_WC_IS_LOADING_SYNC,
  WBRPC_WC_SHOW_ASYNC_MESSAGE_DIALOG,
  WBRPC_SYNC_GET_INITIAL_HOST_URL,
  WBRPC_WCE_DOM_READY,
  WBRPC_WCE_DID_FRAME_FINISH_LOAD,
  WBRPC_WCE_DID_FINISH_LOAD,
  WBRPC_WCE_DID_ATTACH_WEBVIEW
} from '../WBRPCEvents'

class WBRPCWebContents extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    ipcRenderer.on(WBRPC_WCE_DOM_READY, this._handleDomReady)
    ipcRenderer.on(WBRPC_WCE_DID_FRAME_FINISH_LOAD, this._handleDidFrameFinishLoad)
    ipcRenderer.on(WBRPC_WCE_DID_FINISH_LOAD, this._handleDidFinishLoad)
    ipcRenderer.on(WBRPC_WCE_DID_ATTACH_WEBVIEW, this._handleDidAttachWebview)
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
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  sendInputEvent (event, wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_SEND_INPUT_EVENT, event, wcId)
  }

  /**
  * Sends a set of events to the current webcontents
  * @param events: an array of events to send
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  sendInputEvents (events, wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_SEND_INPUT_EVENTS, events, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  goBack (wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_GO_BACK, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  goForward (wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_GO_FORWARD, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  stop (wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_STOP, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  reload (wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_RELOAD, wcId)
  }

  /**
  * Navigates back
  * @param url: the url to load
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  loadURL (url, wcId = undefined) {
    ipcRenderer.send(WBRPC_WC_LOAD_URL, url, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  canGoBackSync (wcId = undefined) {
    return ipcRenderer.sendSync(WBRPC_WC_CAN_GO_BACK_SYNC, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  canGoForwardSync (wcId = undefined) {
    return ipcRenderer.sendSync(WBRPC_WC_CAN_GO_FORWARD_SYNC, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  getURLSync (wcId = undefined) {
    return ipcRenderer.sendSync(WBRPC_WC_GET_URL_SYNC, wcId)
  }

  /**
  * Navigates back
  * @param wcId=undefined: undefined for this webcontents, provide id to run another
  */
  isLoadingSync (wcId = undefined) {
    return ipcRenderer.sendSync(WBRPC_WC_IS_LOADING_SYNC, wcId)
  }

  /* ****************************************************************************/
  // WebContent utils
  /* ****************************************************************************/

  /**
  * Shows an async dialog message
  * @param config: the config for the dialog window
  */
  showAsyncDialogMessage (config) {
    ipcRenderer.send(WBRPC_WC_SHOW_ASYNC_MESSAGE_DIALOG, config)
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
