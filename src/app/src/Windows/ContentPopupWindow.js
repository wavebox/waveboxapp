import { dialog } from 'electron'
import WaveboxWindow from './WaveboxWindow'
import { evtMain } from 'AppEvents'
import { GuestWebPreferences } from 'WebContentsManager'
import { WindowOpeningHandler, WINDOW_OPEN_MODES } from './WindowOpeningEngine'
import { PermissionManager } from 'Permissions'
import { URL } from 'url'
import ElectronWebContentsWillNavigateShim from 'ElectronTools/ElectronWebContentsWillNavigateShim'
import NavigationTouchBarProvider from './NavigationTouchBarProvider'

const privTabMetaInfo = Symbol('privTabMetaInfo')
class ContentPopupWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.CONTENT_POPUP }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param tabMetaInfo=undefined: the tab meta info for the tab we will be hosting
  */
  constructor (tabMetaInfo = undefined) {
    super()
    this[privTabMetaInfo] = tabMetaInfo

    PermissionManager.on('unresolved-permission-requests-changed', this._handleUnresolvedPermissionRequestChanged)
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

    this.showNativeUI()

    // Listen to webview events
    this.window.webContents.on('new-window', this.handleWebContentsNewWindow)
    this.window.webContents.on('did-start-navigation', this.handleWebViewDidStartNavigation)
    ElectronWebContentsWillNavigateShim.on(this.window.webContents, this.handleWebViewWillNavigate)
    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    super.destroy(evt)

    PermissionManager.removeListener('unresolved-permission-requests-changed', this._handleUnresolvedPermissionRequestChanged)
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

  /**
  * Overwrite
  * @return the touchbar
  */
  createTouchbarProvider () {
    return new NavigationTouchBarProvider(this)
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
    WindowOpeningHandler.handleOpenNewWindow(evt, {
      targetUrl: targetUrl,
      frameName: frameName,
      disposition: disposition,
      options: options,
      additionalFeatures: additionalFeatures,
      openingBrowserWindow: this.window,
      openingWindowType: this.windowType,
      tabMetaInfo: this[privTabMetaInfo],
      provisionalTargetUrl: undefined
    }, WINDOW_OPEN_MODES.POPUP_CONTENT)
  }

  /**
  * Handles the webview navigating
  * @param evt: the event that fired
  * @param targetUrl: the url we're navigating to
  */
  handleWebViewWillNavigate = (evt, targetUrl) => {
    WindowOpeningHandler.handleWillNavigate(evt, {
      targetUrl: targetUrl,
      openingBrowserWindow: this.window,
      openingWindowType: this.windowType,
      tabMetaInfo: this[privTabMetaInfo]
    })
  }

  /**
  * Handles the webview starting navigation
  * @param evt: the event that fired
  * @param targetUrl: the url we're navigating to
  */
  handleWebViewDidStartNavigation = (evt, targetUrl) => {
    WindowOpeningHandler.handleDidStartNavigation(evt, {
      targetUrl: targetUrl,
      openingBrowserWindow: this.window,
      openingWindowType: this.windowType,
      tabMetaInfo: this[privTabMetaInfo]
    })
  }

  /* ****************************************************************************/
  // Permission Events
  /* ****************************************************************************/

  /**
  * Handles the set of unresolved permission request handlers changing. As we don't have any injectable UI here
  * we have to fall-back to alert style confirmations like Safari
  * @param wcId: the id of the webcontents the permissions changed for
  * @param pending: the list of pending requests
  */
  _handleUnresolvedPermissionRequestChanged = (wcId, pending) => {
    if (wcId !== this.window.webContents.id) { return }
    if (!pending[0]) { return }

    const permissionType = pending[0]
    const requestURL = this.window.webContents.getURL()
    const purl = requestURL ? new URL(requestURL) : undefined

    let permissionText
    if (permissionType === 'geolocation') {
      permissionText = 'Know your location'
    } else if (permissionType === 'media') {
      permissionText = 'Use your microphone and/or camera'
    } else {
      permissionText = permissionType
    }

    dialog.showMessageBox(this.window, {
      type: 'question',
      buttons: [
        'Later',
        'Block',
        'Allow'
      ],
      cancelId: 0,
      title: 'Permission Request',
      message: [
        `${purl ? `${purl.protocol}//${purl.hostname}` : 'This site'} wants to:`,
        permissionText
      ].join('\n')
    }, (res) => {
      if (res === 0) {
        PermissionManager.resolvePermissionRequest(wcId, permissionType, 'default')
      } else if (res === 1) {
        PermissionManager.resolvePermissionRequest(wcId, permissionType, 'denied')
      } else if (res === 2) {
        PermissionManager.resolvePermissionRequest(wcId, permissionType, 'granted')
      }
    })
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

  /**
  * @return the webcontents which is an editable target
  */
  focusedEditableWebContents () {
    return this.window.webContents
  }

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
}

export default ContentPopupWindow
