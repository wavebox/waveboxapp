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
    //super.create(url, Object.assign({}, safeBrowserWindowOptions, { show: true }))
    const opts=Object.assign({}, safeBrowserWindowOptions, { show: true })
    opts.webPreferences.partition='persist:__chrome_extension:kbfnbcaeplbcioakkpcpgfkobkghlhen'
    delete opts.webPreferences.openerId
    delete opts.webPreferences.guestInstanceId
    delete opts.webContents
    delete opts.webPreferences.preloadURL
    //ALSO disable CORS RW on background session; Needs webContentsId from 1.8.* to get the url to check for bgpage
    //ALSO takes a while to register... not sure why? Maybe the close event doesn't trigger from window.close()
    console.log(opts,url)
    super.create(url,opts)
    this.window.webContents.openDevTools()
    this.window.webContents.on('new-window', (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
      evt.preventDefault()
      console.log("here")
      const contentWindow = new ContentPopupWindow()
      //appWindowManager.addContentWindow(contentWindow)
      contentWindow.create(targetUrl, options)
      //evt.newGuest = contentWindow.window
    })

    // Setup for tab lifecycle
    const webContentsId = this.window.webContents.id
    evtMain.emit(evtMain.WB_TAB_CREATED, webContentsId)
    this.window.webContents.once('destroyed', () => {
      evtMain.emit(evtMain.WB_TAB_DESTROYED, webContentsId)
    })

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
