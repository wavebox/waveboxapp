import { session, ipcMain, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { URL } from 'url'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import { evtMain } from 'AppEvents'
import {
  CRX_TABS_CREATE_FROM_BG_,
  CRX_BROWSER_ACTION_CREATE_FROM_BG_,
  CRX_OPTIONS_CREATE_FROM_BG_,
  CRX_OPTIONS_OPEN_
} from 'shared/crExtensionIpcEvents'
import Resolver from 'Runtime/Resolver'
import { SessionManager } from 'SessionManager'
import ContentPopupWindow from 'Windows/ContentPopupWindow'
import CRExtensionPopupWindow from './CRExtensionPopupWindow'
import CRExtensionTab from './CRExtensionTab'
import { WINDOW_BACKING_TYPES } from 'Windows/WindowBackingTypes'
import { CRExtensionWebPreferences } from 'WebContentsManager'
import ElectronWebContentsWillNavigateShim from 'ElectronTools/ElectronWebContentsWillNavigateShim'

const privPendingCreateWindow = Symbol('privPendingCreateWindow')
const privHtml = Symbol('privHtml')
const privName = Symbol('privName')
const privBrowserWindow = Symbol('privBrowserWindow')
const privPopupWindow = Symbol('privPopupWindow')
const privOptionsWindow = Symbol('privOptionsWindow')

class CRExtensionBackgroundPage {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param extension: the extension
  */
  constructor (extension) {
    this.extension = extension
    this[privHtml] = undefined
    this[privName] = undefined
    this[privBrowserWindow] = undefined
    this[privPendingCreateWindow] = undefined
    this[privPopupWindow] = undefined
    this[privOptionsWindow] = undefined

    // Event handlers
    ipcMain.on(`${CRX_TABS_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreateTab)
    ipcMain.on(`${CRX_BROWSER_ACTION_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreatePopup)
    ipcMain.on(`${CRX_OPTIONS_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreateOptions)

    // Bg page
    this._start()
  }

  destroy () {
    // Event handlers
    ipcMain.removeListener(`${CRX_TABS_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreateTab)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreatePopup)
    ipcMain.removeListener(`${CRX_OPTIONS_CREATE_FROM_BG_}${this.extension.id}`, this.handleCreateOptions)

    if (this[privPopupWindow]) {
      this[privPopupWindow].destroy()
    }

    // Bg page
    this._stop()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isRunning () { return this[privBrowserWindow] && !this[privBrowserWindow].isDestroyed() && !this[privBrowserWindow].webContents.isDestroyed() }
  get webContents () { return this[privBrowserWindow].webContents }
  get webContentsId () { return this.isRunning ? this[privBrowserWindow].webContents.id : undefined }
  get partitionId () { return CRExtensionWebPreferences.partitionIdForExtension(this.extension.id) }
  get affinityId () { return CRExtensionWebPreferences.affinityIdForExtension(this.extension.id) }
  get html () { return this[privHtml] }
  get name () { return this[privName] }

  /* ****************************************************************************/
  // WebContents pass-through
  /* ****************************************************************************/

  /**
  * Provides a function call that will send events to the webcontents
  * @param ...args: the arguments to send
  */
  sendToWebContents = (...args) => {
    if (this.isRunning) {
      this.webContents.send(...args)
    }
  }

  /* ****************************************************************************/
  // Script lifecycle
  /* ****************************************************************************/

  /**
  * Generates the options for the background page
  */
  _generateBackgroundPageOptions () {
    return {
      width: 1,
      height: 1,
      show: false,
      focusable: false,
      skipTaskbar: true,
      webPreferences: {
        backgroundThrottling: false,
        contextIsolation: false, // Intentional as the extension shares the same namespace as chrome.* api and runs in a semi-priviledged position
        partition: this.partitionId,
        sandbox: true,
        nativeWindowOpen: true,
        sharedSiteInstances: true,
        affinity: this.affinityId,
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        webviewTag: false,
        preload: Resolver.crExtensionApi(),
        offscreen: true
      }
    }
  }

  /**
  * Starts the background scripts
  */
  _start () {
    if (!this.extension.manifest.hasBackground) { return }

    if (this.extension.manifest.background.hasHtmlPage) {
      this[privName] = this.extension.manifest.background.htmlPage
      try {
        this[privHtml] = fs.readFileSync(this.extension.manifest.background.getHtmlPageScoped(this.extension.srcPath))
      } catch (ex) {
        this[privHtml] = ''
      }
    } else {
      this[privName] = '_generated_background_page.html'
      this[privHtml] = Buffer.from(this.extension.manifest.background.generateHtmlPageForScriptset())
    }

    this[privBrowserWindow] = new BrowserWindow(this._generateBackgroundPageOptions())
    this[privBrowserWindow].webContents.setFrameRate(1)
    this[privBrowserWindow].webContents.on('new-window', this._handleNewWindow)
    ElectronWebContentsWillNavigateShim.on(
      this[privBrowserWindow].webContents,
      (evt) => evt.preventDefault()
    )

    // Relax cors for extensions that request it
    SessionManager
      .webRequestEmitterFromPartitionId(this.partitionId)
      .headersReceived
      .onBlocking(undefined, this._handleAllUrlHeadersReceived)

    // Start loading
    this._loadBackgroundPage()
  }

  /**
  * Starts the backgroung page by loading the start url
  */
  _loadBackgroundPage = () => {
    if (this.isRunning) {
      const u = new URL(this[privName], `${CR_EXTENSION_PROTOCOL}://${this.extension.id}`).toString()
      this[privBrowserWindow].webContents.loadURL(u)
    }
  }

  /**
  * Stops background scripts
  * @param extension: the extension to stop
  */
  _stop (extension) {
    if (this.isRunning) {
      this[privBrowserWindow].destroy()
    }
    this[privBrowserWindow] = undefined
    this[privHtml] = undefined
    this[privName] = undefined

    evtMain.removeListener(evtMain.WB_TAB_CREATED, this._loadBackgroundPage)
  }

  /* ****************************************************************************/
  // Web Request
  /* ****************************************************************************/

  /**
  * Handles the headers being received and updates them if required
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  _handleAllUrlHeadersReceived = (details, responder) => {
    if (this.isRunning && this.webContentsId === details.webContentsId) {
      if (details.resourceType === 'xhr') {
        const responseHeaders = details.responseHeaders
        const requestHeaders = details.headers
        const updatedHeaders = {
          ...responseHeaders,
          'access-control-allow-credentials': responseHeaders['access-control-allow-credentials'] || ['true'],
          'access-control-allow-headers': [].concat(
            responseHeaders['access-control-allow-headers'],
            requestHeaders['Access-Control-Request-Headers'],
            Object.keys(requestHeaders).filter((k) => k.toLowerCase().startsWith('x-'))
          ),
          'access-control-allow-origin': [
            `${CR_EXTENSION_PROTOCOL}://${this.extension.id}`
          ]
        }
        return responder({ responseHeaders: updatedHeaders })
      }
    }
    return responder({})
  }

  /* ****************************************************************************/
  // Navigation events
  /* ****************************************************************************/

  /**
  * Handles a new window
  * @param ...args: the new window args
  */
  _handleNewWindow = (...args) => {
    const [evt] = args
    evt.preventDefault()

    // There's only ever going to be one here because the host page will follow this flow...
    // - create: sendAsync to ipcMain
    // - window.open: sendSync to ipcMain, return immediately
    // - created: sendAsync to ipcRenderer
    // if anything else happens then the flow broke and we handle a none-case correctly
    if (this[privPendingCreateWindow]) {
      this[privPendingCreateWindow](...args)
      this[privPendingCreateWindow] = undefined
    }
  }

  /* ****************************************************************************/
  // Extension calls
  /* ****************************************************************************/

  /**
  * Creates a tab with the given id
  * @param evt: the event that fired
  * @param transId: the transport id of the call
  * @param url: the start url
  */
  handleCreateTab = (createEvt, transId, url) => {
    const ipcChannel = `${CRX_TABS_CREATE_FROM_BG_}${this.extension.id}${transId}`
    if (this._windowCreateAssertRunning(createEvt.sender, ipcChannel)) {
      this[privPendingCreateWindow] = (windowEvt, targetUrl, frameName, disposition, options, additionalFeatures) => {
        if (targetUrl !== url) { return }

        // Create window
        const openedWindow = new ContentPopupWindow({
          backing: WINDOW_BACKING_TYPES.EXTENSION,
          extensionId: this.extension.id,
          extensionName: this.extension.manifest.name
        })
        openedWindow.create(targetUrl, {
          ...options,
          // Overwrite some settings configured by the bg page
          frame: true,
          skipTaskbar: false,
          focusable: true,
          webPreferences: {
            ...options.webPreferences,
            ...CRExtensionWebPreferences.defaultWebPreferences(this.extension.id),
            offscreen: false // parent window will make this offscreen but we don't want it
          }
        })
        windowEvt.newGuest = openedWindow.window

        // Respond to requestor
        if (createEvt.sender && !createEvt.sender.isDestroyed()) {
          createEvt.sender.send(
            ipcChannel,
            null,
            CRExtensionTab.dataFromWebContentsId(this.extension, openedWindow.tabIds()[0])
          )
        }
      }
    }
  }

  /**
  * Creates a tab with the given id
  * @param evt: the event that fired
  * @param transId: the transport id of the call
  * @param tabId: the id of the tab opening this popup
  * @param url: the start url
  */
  handleCreatePopup = (createEvt, transId, tabId, url) => {
    const ipcChannel = `${CRX_BROWSER_ACTION_CREATE_FROM_BG_}${this.extension.id}${transId}`
    if (this._windowCreateAssertRunning(createEvt.sender, ipcChannel)) {
      this[privPendingCreateWindow] = (windowEvt, targetUrl, frameName, disposition, options, additionalFeatures) => {
        if (targetUrl !== url) { return }

        if (this[privPopupWindow]) {
          this[privPopupWindow].destroy()
        }
        this[privPopupWindow] = new CRExtensionPopupWindow(tabId, {
          ...options,
          webPreferences: {
            ...options.webPreferences,
            ...CRExtensionWebPreferences.defaultWebPreferences(this.extension.id),
            offscreen: false // parent window will make this offscreen but we don't want it
          }
        }, this.extension)
        windowEvt.newGuest = this[privPopupWindow].window

        // Respond to requestor
        if (createEvt.sender && !createEvt.sender.isDestroyed()) {
          createEvt.sender.send(
            ipcChannel,
            null,
            { id: this[privPopupWindow].window.webContents.id }
          )
        }
      }
    }
  }

  /**
  * Creates an options page
  * @param evt: the event that fired
  * @param transId: the transport id of the call
  */
  handleCreateOptions = (createEvt, transId) => {
    // Don't assert that the bg page is running here like we do with the other calls, we handle that case
    const ipcChannel = `${CRX_OPTIONS_CREATE_FROM_BG_}${this.extension.id}${transId}`

    // Don't create two
    if (this[privOptionsWindow] && !this[privOptionsWindow].isDestroyed()) {
      this[privOptionsWindow].focus()
      setTimeout(() => {
        if (createEvt.sender && !createEvt.sender.isDestroyed()) {
          createEvt.sender.send(ipcChannel, null, null)
        }
      })
      return
    }

    // Auto-create the url
    const url = new URL(
      this.extension.manifest.optionsPage,
      `${CR_EXTENSION_PROTOCOL}://${this.extension.id}`
    ).toString()

    // Prep the opener
    this[privPendingCreateWindow] = (windowEvt, targetUrl, frameName, disposition, options, additionalFeatures) => {
      if (targetUrl !== url) { return }

      const openedWindow = new ContentPopupWindow({
        backing: WINDOW_BACKING_TYPES.EXTENSION,
        extensionId: this.extension.id,
        extensionName: this.extension.manifest.name
      })

      openedWindow.create(targetUrl, {
        ...options,
        title: this.extension.manifest.name,
        minWidth: 300,
        minHeight: 300,
        width: undefined,
        height: undefined,
        show: true,
        backgroundColor: '#FFFFFF',
        useContentSize: true,
        // Overwrite some settings configured by the bg page
        frame: true,
        skipTaskbar: false,
        focusable: true,
        webPreferences: {
          ...options.webPreferences,
          ...CRExtensionWebPreferences.defaultWebPreferences(this.extension.id),
          offscreen: false // parent window will make this offscreen but we don't want it
        }
      })

      windowEvt.newGuest = openedWindow.window

      // Store the window
      if (this[privOptionsWindow] && !this[privOptionsWindow].isDestroyed()) {
        this[privOptionsWindow].destroy()
      }
      this[privOptionsWindow] = openedWindow
      this[privOptionsWindow].on('closed', () => {
        this[privOptionsWindow] = undefined
      })

      // Respond to requestor
      if (createEvt.sender && !createEvt.sender.isDestroyed()) {
        createEvt.sender.send(
          ipcChannel,
          null,
          { id: openedWindow.window.webContents.id }
        )
      }
    }
  }

  /**
  * Asserts the background page is running for creating a window and if not responds to the ipc accordinly
  * @param sender: the webcontents who sent originally
  * @param ipcResponseChannel: the ipc channel to respond on
  * @return true if the window is running, false otherwise
  */
  _windowCreateAssertRunning (sender, ipcResponseChannel) {
    if (!this.isRunning) {
      sender.send(
        ipcResponseChannel,
        {},
        new Error(`Background page is not running for ${this.extension.id}`),
        undefined
      )
      return false
    } else {
      return true
    }
  }

  /* ****************************************************************************/
  // Dev & data management
  /* ****************************************************************************/

  /**
  * Opens the developer tools
  */
  openDevTools () {
    if (this.isRunning) {
      this.webContents.openDevTools({ mode: 'detach' })
    }
  }

  /**
  * Clears the current browser session
  * @param reloadOnComplete=true: set to false not to reload on clearing the session
  * @return promise
  */
  clearBrowserSession (reloadOnComplete = true) {
    const ses = session.fromPartition(this.partitionId)
    return Promise.resolve()
      .then(() => { return new Promise((resolve) => { ses.clearStorageData(resolve) }) })
      .then(() => { return new Promise((resolve) => { ses.clearCache(resolve) }) })
      .then(() => {
        // We're still living in the heap managed by session in the callback. Exceptions here
        // can bring down the entire app, so give ourselves a new heap with setTimeout
        return new Promise((resolve) => {
          const self = this
          setTimeout(function () {
            if (reloadOnComplete) { self.reload() }
            resolve()
          })
        })
      })
  }

  /**
  * Reloads the background page
  */
  reload () {
    if (this.isRunning) {
      this.webContents.reload()
    }
  }

  /**
  * Launches the options page
  */
  launchOptions () {
    const targetUrl = new URL(this.extension.manifest.optionsPage, `${CR_EXTENSION_PROTOCOL}://${this.extension.id}`).toString()
    if (this.isRunning) {
      this.webContents.send(`${CRX_OPTIONS_OPEN_}${this.extension.id}`, targetUrl)
    } else {
      // If the background page isn't running we dummy up the calls as if it is

      // Send the create call
      const createEvt = {
        sender: { isDestroyed: () => false, send: () => {} }
      }
      this.handleCreateOptions(createEvt, '_')

      // Send the window.open call
      const winEvt = { newGuest: undefined }
      const winOpts = this._generateBackgroundPageOptions()
      this[privPendingCreateWindow](winEvt, targetUrl, '', '', winOpts, '')

      // Action the window.open call
      if (winEvt.newGuest) {
        winEvt.newGuest.webContents.loadURL(targetUrl)
      }
      this[privPendingCreateWindow] = undefined
    }
  }
}

export default CRExtensionBackgroundPage
