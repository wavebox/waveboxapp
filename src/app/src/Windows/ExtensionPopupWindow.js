import WaveboxWindow from './WaveboxWindow'
import { evtMain } from 'AppEvents'
import { GuestWebPreferences } from 'WebContentsManager'

const privTabMetaInfo = Symbol('privTabMetaInfo')
const privWindowResizeInterval = Symbol('privWindowResizeInterval')
class ExtensionPopupWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.EXTENSION_POPUP }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param tabMetaInfo=undefined: the tab meta info for the tab we will be hosting
  */
  constructor (tabMetaInfo = undefined) {
    super()
    this[privTabMetaInfo] = tabMetaInfo
    this[privWindowResizeInterval] = null
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get allowsGuestClosing () { return true }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param url: the start url
  * @param windowOptions={}: the configuration for the window. Must be directly
  * from the parent webContents
  */
  create (url, windowOptions = {}) {
    if (!windowOptions.webPreferences) {
      windowOptions.webPreferences = {}
    }
    GuestWebPreferences.sanitizeForGuestUse(windowOptions.webPreferences)

    // Blank urls are often used to just skim the referrer out of the request. This
    // can lead to a phantom window popping up and then shutting down. To prevent this
    // delay showing them on instances that might be this
    const shouldDelayShow = url === '' || url === 'about:blank'

    // The browser settings don't need to be sanitized as they should be in the same thread
    // and come from the parent webContents.
    const options = {
      ...windowOptions,
      backgroundColor: '#FFFFFF',
      frame: false,
      width: 100,
      height: 100,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      useContentSize: true,
      center: true, //obviously we need some positining info
      show: !shouldDelayShow
    }

    // Make sure we defer loading of the url so we can customize it further
    super.create(undefined, options)

    // If we've decided to delay the show above then wait for the ready-to-show
    // event. When the window is ready to show check if the url is blank again. If
    // it is wait a cautionary 500ms before opening. In this case it's normally the host
    // page try to open a url without a referrer. Removing this though can cause the window
    // to flash up. Just be careful when re-accessing window, expect it to be destroyed sometimes
    if (shouldDelayShow) {
      this.window.on('ready-to-show', () => {
        const windowCpy = this.window
        if (windowCpy.isDestroyed() || windowCpy.webContents.isDestroyed()) { return }
        const url = windowCpy.webContents.getURL()

        if (!url || url === 'about:blank') {
          setTimeout(() => {
            if (windowCpy.isDestroyed() || windowCpy.webContents.isDestroyed()) { return }
            windowCpy.show()
          }, 500)
        } else {
          windowCpy.show()
        }
      })
    }

    // Load the initial url
    if (!options.webContents || url !== 'about:blank') {
      // For the same reasons in https://github.com/electron/electron/blob/6ebd00267e3dbe06ee32c7f31b1b22ee77fde919/lib/browser/guest-window-manager.js
      // We should not call `loadURL` if the window was constructed from an
      // existing webContents(window.open in a sandboxed renderer) and if the url
      // is not 'about:blank'.
      this.window.loadURL(url)
    }

    // Setup for tab lifecycle
    const webContentsId = this.window.webContents.id
    this.emit('tab-created', { sender: this }, webContentsId)
    evtMain.emit(evtMain.WB_TAB_CREATED, { sender: this }, webContentsId)
    this.window.webContents.once('destroyed', () => {
      this.emit('tab-destroyed', { sender: this }, webContentsId)
      evtMain.emit(evtMain.WB_TAB_DESTROYED, { sender: this }, webContentsId)
    })

    // Listen to window events
    this.window.on('blur', this.handleBlur)
    this.window.on('show', this.handleShow)

    // Listen to webcontents events
    this.window.webContents.on('new-window', this.handleWebContentsNewWindow)

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    super.destroy(evt)

    clearInterval(this[privWindowResizeInterval])
  }

  /* ****************************************************************************/
  // Overwritable behaviour
  /* ****************************************************************************/

  /**
  * Checks if the webcontents is allowed to navigate to the next url. If false is returned
  * it will be prevented
  * @param evt: the event that fired
  * @param browserWindow: the browserWindow that's being checked
  * @param nextUrl: the next url to navigate
  * @return false to suppress, true to allow
  */
  allowNavigate (evt, browserWindow, nextUrl) {
    return true
  }

  /* ****************************************************************************/
  // Window events
  /* ****************************************************************************/

  /**
  * Hanldes the window showing
  * @param evt: the event that fired
  */
  handleShow = (evt) => {
    clearInterval(this[privWindowResizeInterval])
    this[privWindowResizeInterval] = setInterval(this.autoResizeWindow, 1000)
  }

  /**
  * Handles the window bluring
  * @param evt: the event that fired
  */
  handleBlur = (evt) => {
    if (this.window.webContents.isDevToolsOpened()) {
      return
    }
    this.close()
  }

  /**
  * Automatically resizes the window by looking at the size of the html element
  */
  autoResizeWindow = () => {
    this.window.webContents.executeJavaScript(`document.head && document.head.parentElement ? [document.head.parentElement.offsetWidth, document.head.parentElement.offsetHeight] : undefined`)
      .then((size) => {
        if (size) {
          if (this.window && !this.window.isDestroyed()) {
            this.window.setContentSize(size[0], size[1], true)
          }
        }
      })
  }

  /* ****************************************************************************/
  // Webcontents events
  /* ****************************************************************************/

  /**
  * Handles the webcontents requesting a new window
  * @param evt: the event that fired
  */
  handleWebContentsNewWindow = (evt) => {
    evt.preventDefault()
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

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    return tabId === this.window.webContents.id ? this[privTabMetaInfo] : undefined
  }

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
}

export default ExtensionPopupWindow
