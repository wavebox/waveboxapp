import EventEmitter from 'events'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const privBindings = Symbol('privBindings')
const supportedListeners = new Set([
  'window-focus',
  'did-attach-webview'
])

class WebViewGroupEventDispatcher extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privBindings] = Array.from(supportedListeners).reduce((acc, k) => {
      acc[k] = false
      return acc
    }, {})

    this.on('newListener', this._handleNewListener)
    this.on('removeListener', this._handleRemoveListener)
  }

  /* **************************************************************************/
  // Listener housekeeping
  /* **************************************************************************/

  /**
  * Handles a new listener being added
  * @param eventName: the name of the event
  */
  _handleNewListener = (eventName) => {
    if (!supportedListeners.has(eventName)) { return }
    if (this[privBindings][eventName]) { return }

    // Add the listener
    switch (eventName) {
      case 'window-focus':
        WBRPCRenderer.browserWindow.on('focus', this._handleBrowserWindowFocus)
        break
      case 'did-attach-webview':
        WBRPCRenderer.webContents.on('did-attach-webview', this._handleWebContentsAttached)
        break
    }

    this[privBindings][eventName] = true
  }

  /**
  * Handles a new listener being removed
  * @param eventName: the name of the event
  */
  _handleRemoveListener = (eventName) => {
    if (!supportedListeners.has(eventName)) { return }
    if (this.listenerCount(eventName) !== 0) { return }
    if (this[privBindings][eventName] !== true) { return }

    // Remove the listener
    switch (eventName) {
      case 'window-focus':
        WBRPCRenderer.browserWindow.removeListener('focus', this._handleBrowserWindowFocus)
        break
      case 'did-attach-webview':
        WBRPCRenderer.webContents.removeListener('did-attach-webview', this._handleWebContentsAttached)
        break
    }

    this[privBindings][eventName] = false
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  _handleBrowserWindowFocus = () => {
    this.emit('window-focus', { sender: this })
  }

  _handleWebContentsAttached = (evt, attachedId) => {
    this.emit('did-attach-webview', { sender: this }, attachedId)
  }
}

export default new WebViewGroupEventDispatcher()
