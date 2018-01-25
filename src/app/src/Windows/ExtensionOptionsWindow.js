import { shell } from 'electron'
import WaveboxWindow from './WaveboxWindow'
import { WINDOW_BACKING_TYPES } from './WindowBackingTypes'

class ExtensionOptionsWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param url: the start url
  * @param options={}: the configuration for the window
  */
  create (url, options = {}) {
    // The browser settings don't need to be sanitized as they should be in the same thread
    // and come from the parent webContents
    super.create(url, Object.assign({}, options, { show: true }))

    // Bind listeners
    this.window.webContents.on('new-window', this.handleNewWindow)

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    if (this.window && !this.window.isDestroyed() && this.window.webContents) {
      this.window.webContents.removeListener('new-window', this.handleNewWindow)
    }
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // Window events
  /* ****************************************************************************/

  /**
  * Handles a new window
  * @param evt: the event that fired
  * @param targetUrl: the url to open
  */
  handleNewWindow = (evt, targetUrl) => {
    evt.preventDefault()
    shell.openExternal(targetUrl)
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused tab
  */
  focusedTabId () {
    return this.window.webContents.id
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return [this.window.webContents.id]
  }
  tabMetaInfo (tabId) {
    if (tabId === this.window.webContentsId) {
      return {
        backing: WINDOW_BACKING_TYPES.EXTENSION
      }
    } else {
      return undefined
    }
  }

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
  zoomIn () { return this }
  zoomOut () { return this }
  zoomReset () { return this }
}

export default ExtensionOptionsWindow
