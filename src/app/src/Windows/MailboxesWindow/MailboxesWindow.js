import electron from 'electron'
import WaveboxWindow from '../WaveboxWindow'
import { settingsStore } from 'stores/settings'
import { accountActions, ServiceDataReducer } from 'stores/account'
import { userStore } from 'stores/user'
import { GuestWebPreferences } from 'WebContentsManager'
import {
  AuthGoogle,
  AuthMicrosoft,
  AuthSlack,
  AuthTrello,
  AuthWavebox
} from 'AuthProviders'
import querystring from 'querystring'
import {
  WB_MAILBOXES_WINDOW_REQUEST_GRACEFUL_RELOAD,
  WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD,
  WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE,
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT,
  WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER,
  WB_MAILBOXES_WINDOW_SHOW_NEWS,
  WB_MAILBOXES_WINDOW_ADD_ACCOUNT,

  WB_USER_CHECK_FOR_UPDATE,
  WB_SQUIRREL_UPDATE_DOWNLOADED,
  WB_SQUIRREL_UPDATE_ERROR,
  WB_SQUIRREL_UPDATE_AVAILABLE,
  WB_SQUIRREL_UPDATE_NOT_AVAILABLE,
  WB_SQUIRREL_UPDATE_CHECK_START,
  WB_SQUIRREL_UPDATE_DISABLED,

  WB_FOCUS_MAILBOXES_WINDOW,

  WB_TOGGLE_TRAY_WITH_BOUNDS
} from 'shared/ipcEvents'
import {
  UISettings,
  TraySettings
} from 'shared/Models/Settings'
import Resolver from 'Runtime/Resolver'
import MailboxesWindowTabManager from './MailboxesWindowTabManager'
import MailboxesWindowBehaviour from './MailboxesWindowBehaviour'

const ALLOWED_URLS = [
  'file://' + Resolver.mailboxesScene('mailboxes.html'),
  'file://' + Resolver.mailboxesScene('offline.html')
]
const MIN_WINDOW_WIDTH = 400
const MIN_WINDOW_HEIGHT = 300

let singletonAttached
class MailboxesWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * @return true if the mailboxes window is attached, false otherwise
  */
  static isAttached () { return !!singletonAttached }

  /**
  * @return the attached mailboxes window
  */
  static getAttached () { return singletonAttached }

  static get windowType () { return this.WINDOW_TYPES.MAIN }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    if (singletonAttached) {
      throw new Error('Mailboxes window already attached')
    }

    super('mailbox_window_state')
    singletonAttached = this

    this.authGoogle = new AuthGoogle()
    this.authTrello = new AuthTrello()
    this.authSlack = new AuthSlack()
    this.authMicrosoft = new AuthMicrosoft()
    this.authWavebox = new AuthWavebox()
    this.gracefulReloadTimeout = null
    this.tabManager = null
    this.behaviour = null
  }

  /**
  * Generates the url for the window
  * @return a fully qualified url to give to the window object
  */
  generateWindowUrl () {
    const userState = userStore.getState()
    const params = querystring.stringify({
      clientId: userState.clientId,
      clientToken: userState.clientToken
    })
    return `file://${Resolver.mailboxesScene('mailboxes.html')}?${params}`
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get rootWebContentsHasContextMenu () { return false }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the app
  * @param hidden=false: true to start hidden
  * @return this
  */
  create (hidden = false) {
    const screenSize = electron.screen.getPrimaryDisplay().workAreaSize
    const settingsState = settingsStore.getState()
    super.create(this.generateWindowUrl(), {
      show: false,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      width: Math.min(Math.max(screenSize.width, MIN_WINDOW_WIDTH), 1200),
      height: Math.min(Math.max(screenSize.height, MIN_WINDOW_HEIGHT), 1000),
      fullscreenable: true,
      titleBarStyle: process.platform === 'darwin' && settingsState.launched.ui.showTitlebar === false ? 'hidden' : 'default',
      frame: settingsState.launched.ui.showTitlebar,
      title: 'Wavebox',
      ...(process.platform === 'darwin' && settingsState.launched.ui.vibrancyMode !== UISettings.VIBRANCY_MODES.NONE ? {
        vibrancy: settingsState.launched.ui.electronVibrancyMode
      } : {
        backgroundColor: '#f2f2f2'
      }),
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true,
        backgroundThrottling: false,
        plugins: true
      }
    })
    this.window.once('ready-to-show', () => {
      if (!hidden) { this.window.show() }
    })
    this.window.on('minimize', this._handleWindowMinimize)
    this.tabManager = new MailboxesWindowTabManager(this.window.webContents.id)
    this.behaviour = new MailboxesWindowBehaviour(this.window.webContents.id, this.tabManager)

    // Bind event listeners
    electron.ipcMain.on(WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD, this.handleAcceptGracefulReload)
    electron.ipcMain.on(WB_FOCUS_MAILBOXES_WINDOW, this.handleFocusMailboxesWindow)

    this.window.on('focus', () => {
      accountActions.reduceServiceData.defer(undefined, ServiceDataReducer.mergeChangesetOnActive)
    })

    this.window.webContents.on('will-attach-webview', this._handleWillAttachWebview)

    // remove built in listener so we can handle this on our own
    this.window.webContents.removeAllListeners('devtools-reload-page')
    this.window.webContents.on('devtools-reload-page', () => this.reloadWaveboxWindow())

    return this
  }

  /**
  * Handles destroy being called
  */
  destroy (evt) {
    this.tabManager.destroy()
    this.behaviour.destroy()
    clearTimeout(this.gracefulReloadTimeout)

    electron.ipcMain.removeListener(WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD, this.handleAcceptGracefulReload)
    electron.ipcMain.removeListener(WB_FOCUS_MAILBOXES_WINDOW, this.handleFocusMailboxesWindow)

    singletonAttached = undefined
    super.destroy(evt)
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
    return !!ALLOWED_URLS.find((allowed) => nextUrl.startsWith(allowed))
  }

  /* ****************************************************************************/
  // Window events
  /* ****************************************************************************/

  /**
  * Handles the window minimizing
  * @param evt: the event that fired
  */
  _handleWindowMinimize = (evt) => {
    if (TraySettings.SUPPORTS_TASKBAR_HIDING) {
      const settingsState = settingsStore.getState()
      if (settingsState.tray.show && settingsState.tray.removeFromTaskbarWin32) {
        this.window.hide()
        evt.preventDefault()
      }
    }
  }

  /* ****************************************************************************/
  // Webview events
  /* ****************************************************************************/

  /**
  * Handles a webview preparing to attach
  * @param evt: the event that fired
  * @param webViewWebPreferences: the webPreferences of the new webview
  * @param webViewProperties: the properites of the new webview
  */
  _handleWillAttachWebview = (evt, webViewWebPreferences, webViewProperties) => {
    GuestWebPreferences.sanitizeForGuestUse(webViewWebPreferences)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles the webview accepting a graceful reload
  * @param evt: the event that fired
  * @param body: the arguments from the body
  */
  handleAcceptGracefulReload = (evt, body) => {
    if (evt.sender === this.window.webContents) {
      clearTimeout(this.gracefulReloadTimeout)
      this.window.loadURL(this.generateWindowUrl())
    }
  }

  /**
  * Shows and focuses this window
  * @param evt: the event that fired
  */
  handleFocusMailboxesWindow = (evt) => {
    this.show()
    this.focus()
  }

  /* ****************************************************************************/
  // Mailbox Actions
  /* ****************************************************************************/

  /**
  * Reloads the current account
  * @return this
  */
  reload () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = electron.webContents.fromId(wcId)
    if (!wc) { return }
    wc.reload()
  }

  /**
  * Reloads the webview
  * @return this
  */
  reloadWaveboxWindow () {
    clearTimeout(this.gracefulReloadTimeout)
    this.window.webContents.send(WB_MAILBOXES_WINDOW_REQUEST_GRACEFUL_RELOAD, {})
    this.gracefulReloadTimeout = setTimeout(() => {
      this.window.loadURL(this.generateWindowUrl())
    }, 750)
    return this
  }

  /**
  * Launches the preferences modal
  * @return this
  */
  launchPreferences () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, { })
    return this
  }

  /**
  * Launches the wavebox account
  * @return this
  */
  launchWaveboxAccount () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, {})
    return this
  }

  /**
  * Launches the support center
  * @return this
  */
  launchSupportCenter () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, {})
    return this
  }

  /**
  * Launches the whats new/news window
  * @return this
  */
  launchWhatsNew () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SHOW_NEWS, {})
    return this
  }

  /**
  * Starts the account process
  * @return this
  */
  addAccount () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, { })
    return this
  }

  /**
  * Tells the frame a download is complete
  * @param path: the path of the saved file
  * @param filename: the name of the file
  * @return this
  */
  downloadCompleted (path, filename) {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, {
      path: path,
      filename: filename
    })
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Switching Mailbox
  /* ****************************************************************************/

  /**
  * Switches mailbox
  * @param mailboxId: the id of the mailbox to switch to
  * @return this
  */
  switchMailbox (mailboxId) {
    this.show().focus()
    accountActions.changeActiveMailbox(mailboxId)
    return this
  }

  /**
  * Switches service
  * @param serviceId: the id of the service to swtich to
  * @return this
  */
  switchService (serviceId) {
    this.show().focus()
    accountActions.changeActiveService(serviceId)
    return this
  }

  /**
  * Switches to the previous mailbox
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchPrevMailbox (allowCycling = false) {
    this.show().focus()
    accountActions.changeActiveMailboxToPrev(allowCycling)
    return this
  }

  /**
  * Switches to the next mailbox
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchNextMailbox (allowCycling = false) {
    this.show().focus()
    accountActions.changeActiveMailboxToNext(allowCycling)
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Switching Services
  /* ****************************************************************************/

  /**
  * Switches to a service at the given index. This call will fail silently if there is no
  * service at the given index
  * @param index: the index you want to switch to
  * @return this
  */
  switchToServiceAtIndex (index) {
    this.show().focus()
    accountActions.changeActiveServiceIndex(index)
    return this
  }

  /**
  * Switches to the previous service
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchPrevService (allowCycling = false) {
    this.show().focus()
    accountActions.changeActiveServiceToPrev(allowCycling)
    return this
  }

  /**
  * Switches to the next service
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchNextService (allowCycling = false) {
    this.show().focus()
    accountActions.changeActiveServiceToNext(allowCycling)
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Switching Mailbox & Service
  /* ****************************************************************************/

  /**
  * Switches to the next mailbox or service in the stack
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchNextTab () {
    this.show().focus()
    accountActions.changeActiveTabToNext()
    return this
  }

  /**
  * Switches to the previous mailbox or service in the stack
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchPrevTab () {
    this.show().focus()
    accountActions.changeActiveTabToPrev()
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Navigation
  /* ****************************************************************************/

  /**
  * Tells the active mailbox to navigate back
  * @return this
  */
  navigateBack () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = electron.webContents.fromId(wcId)
    if (!wc) { return }
    wc.goBack()
    return this
  }

  /**
  * Tells the active mailbox to navigate back
  * @return this
  */
  navigateForward () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = electron.webContents.fromId(wcId)
    if (!wc) { return }
    wc.goForward()
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Update
  /* ****************************************************************************/

  /**
  * Checks for updates and keeps the UI up to date with progress
  */
  userCheckForUpdate () {
    this.window.webContents.send(WB_USER_CHECK_FOR_UPDATE, {})
  }

  /* ****************************************************************************/
  // Tray
  /* ****************************************************************************/

  /**
  * @depricated the tray object should be kept on the main thread. We shouldn't
  * be driving this down to the mailboxes window
  */
  __depricatedToggleTray () {
    this.window.webContents.send(WB_TOGGLE_TRAY_WITH_BOUNDS, {})
  }

  /* ****************************************************************************/
  // Mailbox Actions: Squirrel
  /* ****************************************************************************/

  /**
  * Indicates that the squirrel update service downloaded an update
  */
  squirrelUpdateDownloaded () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_DOWNLOADED, { })
  }

  /**
  * Indicates that the squirrel update failed to check or fetch updates
  */
  squirrelUpdateError () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_ERROR, { })
  }

  /**
  * Indicates that the squirrel update is available
  */
  squirrelUpdateAvailable () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_AVAILABLE, { })
  }

  /**
  * Indicates that the squirrel update is not available
  */
  squirrelUpdateNotAvailable () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_NOT_AVAILABLE, { })
  }

  /**
  * Indicates that squirrel is checking for updates
  */
  squirrelCheckingForUpdate () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_CHECK_START, { })
  }

  /**
  * Indicates that squirrel updates have been disabled
  */
  squirrelUpdateDisabled () {
    this.window.webContents.send(WB_SQUIRREL_UPDATE_DISABLED, { })
  }

  /* ****************************************************************************/
  // Actions: Dev
  /* ****************************************************************************/

  /**
  * Opens the dev tools for the webview
  */
  openDevTools () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = electron.webContents.fromId(wcId)
    if (!wc) { return }
    wc.openDevTools()
    return this
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused webcontents
  */
  focusedTabId () {
    return this.tabManager.activeTabId
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return this.tabManager.allWebContentIds
  }

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    return this.tabManager.tabMetaInfo(tabId)
  }

  /**
  * @return process info about the tabs with { webContentsId, description, pid }
  */
  webContentsProcessInfo () {
    return this.tabIds().map((tabId) => {
      const wc = electron.webContents.fromId(tabId)
      const { mailbox, service } = this.tabManager.getService(tabId)
      return {
        webContentsId: tabId,
        pid: wc ? wc.getOSProcessId() : undefined,
        description: mailbox && service ? `${service.humanizedType}: ${mailbox.displayName}` : undefined,
        url: wc ? wc.getURL() : undefined
      }
    }).concat([{
      webContentsId: this.window.webContents.id,
      pid: this.window.webContents.getOSProcessId(),
      description: 'Main Wavebox Window'
    }])
  }
}

export default MailboxesWindow
