import WaveboxWindow from './WaveboxWindow'
import { evtMain } from 'AppEvents'

class ContentPopupWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param ownerId: the id of the owner - mailbox/service
  */
  constructor (ownerId) {
    super()
    this.ownerId = ownerId
  }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param url: the start url
  * @param safeBrowserWindowOptions={}: the configuration for the window. Must be directly
  * from the parent webContents
  */
  create (url, safeBrowserWindowOptions = {}) {
    // The browser settings don't need to be sanitized as they should be in the same thread
    // and come from the parent webContents
    super.create(url, Object.assign({}, safeBrowserWindowOptions, { show: true }))

    // Setup for tab lifecycle
    const webContentsId = this.window.webContents.id
    evtMain.emit(evtMain.WB_TAB_CREATED, {}, webContentsId)
    this.window.webContents.once('destroyed', () => {
      evtMain.emit(evtMain.WB_TAB_DESTROYED, {}, webContentsId)
    })

    // Listen to webview events
    this.window.webContents.on('new-window', this.handleWebContentsNewWindow)

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // Webcontents events
  /* ****************************************************************************/

  /**
  * Handles the webcontents requesting a new window
  * @param evt: the event that fired
  * @param targetUrl: the webview url
  * @param frameName: the name of the frame
  * @param disposition: the frame disposition
  * @param options: the browser window options
  * @param additionalFeatures: The non-standard features
  */
  handleWebContentsNewWindow = (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
    evt.preventDefault()

    const contentWindow = new ContentPopupWindow(this.ownerId)
    contentWindow.create(targetUrl, options)
    evt.newGuest = contentWindow.window
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

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
  zoomIn () { return this }
  zoomOut () { return this }
  zoomReset () { return this }
}

export default ContentPopupWindow
