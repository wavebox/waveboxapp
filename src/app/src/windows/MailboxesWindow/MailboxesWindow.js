import electron from 'electron'
import WaveboxWindow from '../WaveboxWindow'
import mailboxStore from 'stores/mailboxStore'
import settingStore from 'stores/settingStore'
import userStore from 'stores/userStore'
import CRExtensionUISubscriber from 'Extensions/Chrome/CRExtensionUISubscriber'
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
  WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR,
  WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU,
  WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE,
  WB_MAILBOXES_WINDOW_OPEN_MAILTO_LINK,
  WB_MAILBOXES_WINDOW_SWITCH_MAILBOX,
  WB_MAILBOXES_WINDOW_SWITCH_SERVICE,
  WB_WINDOW_NAVIGATE_WEBVIEW_BACK,
  WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD,
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER,
  WB_MAILBOXES_WINDOW_SHOW_NEWS,
  WB_MAILBOXES_WINDOW_ADD_ACCOUNT,
  WB_WINDOW_RELOAD_WEBVIEW,
  WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW,
  WB_MAILBOXES_WINDOW_CHANGE_PRIMARY_SPELLCHECK_LANG,

  WB_USER_CHECK_FOR_UPDATE,
  WB_SQUIRREL_UPDATE_DOWNLOADED,
  WB_SQUIRREL_UPDATE_ERROR,
  WB_SQUIRREL_UPDATE_AVAILABLE,
  WB_SQUIRREL_UPDATE_NOT_AVAILABLE,
  WB_SQUIRREL_UPDATE_CHECK_START,
  WB_SQUIRREL_UPDATE_DISABLED,

  WBECRX_RELOAD_OWNER
} from 'shared/ipcEvents'
import {
  TraySettings,
  UISettings
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
    const params = querystring.stringify({
      clientId: userStore.clientId,
      clientToken: userStore.clientToken
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
    super.create(this.generateWindowUrl(), {
      show: false,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      width: Math.min(Math.max(screenSize.width, MIN_WINDOW_WIDTH), 1200),
      height: Math.min(Math.max(screenSize.height, MIN_WINDOW_HEIGHT), 1000),
      fullscreenable: true,
      titleBarStyle: process.platform === 'darwin' && settingStore.ui.showTitlebar === false ? 'hidden' : 'default',
      frame: settingStore.ui.showTitlebar,
      title: 'Wavebox',
      ...(process.platform === 'darwin' && settingStore.launched.ui.vibrancyMode !== UISettings.VIBRANCY_MODES.NONE ? {
        vibrancy: settingStore.launched.ui.electronVibrancyMode
      } : {
        backgroundColor: '#f2f2f2'
      }),
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false,
        plugins: true
      }
    })
    this.window.once('ready-to-show', () => {
      if (!hidden) { this.window.show() }
    })
    this.tabManager = new MailboxesWindowTabManager(this.window.webContents.id)
    this.behaviour = new MailboxesWindowBehaviour(this.window.webContents.id, this.tabManager)

    // Bind window behaviour events
    if (TraySettings.SUPPORTS_TRAY_MINIMIZE_CONFIG) {
      // Preventing default on minimize has little effect. The window saver doesn't take note of minimized state
      // though so we can query this to see what the last state was and re-apply that on restore
      this.window.on('minimize', (evt) => {
        if (settingStore.tray.show && settingStore.tray.hideWhenMinimized) {
          evt.preventDefault()
          this.window.hide()
        }
      })
    }

    // Bind event listeners
    electron.ipcMain.on(WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD, this.handleAcceptGracefulReload)
    electron.ipcMain.on(WBECRX_RELOAD_OWNER, this.handleCRXReloadOwner)

    // We're locking on to our window. This stops file drags redirecting the page
    this.window.webContents.on('will-navigate', (evt, url) => {
      const match = ALLOWED_URLS.findIndex((allowed) => allowed.indexOf(url) === 0)
      if (!match) {
        evt.preventDefault()
      }
    })

    // remove built in listener so we can handle this on our own
    this.window.webContents.removeAllListeners('devtools-reload-page')
    this.window.webContents.on('devtools-reload-page', () => this.reloadWaveboxWindow())

    CRExtensionUISubscriber.subscribe(this.window.webContents)

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
    electron.ipcMain.removeListener(WBECRX_RELOAD_OWNER, this.handleCRXReloadOwner)

    singletonAttached = undefined
    super.destroy(evt)
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
  * Handles an extension requesting the owner is reloaded
  * @param evt: the event that fired
  */
  handleCRXReloadOwner = (evt) => {
    this.reload()
  }

  /* ****************************************************************************/
  // Mailbox Actions
  /* ****************************************************************************/

  /**
  * Reloads the current account
  * @return this
  */
  reload () {
    this.window.webContents.send(WB_WINDOW_RELOAD_WEBVIEW, {})
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
  * Toggles the sidebar
  * @return this
  */
  toggleSidebar () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR, { })
    return this
  }

  /**
  * Toggles the app menu
  * @return this
  */
  toggleAppMenu () {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU, { })
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

  /**
  * Opens a mailto link
  * @param mailtoLink: the link to open
  * @return this
  */
  openMailtoLink (mailtoLink) {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_OPEN_MAILTO_LINK, { mailtoLink: mailtoLink })
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Switching Mailbox
  /* ****************************************************************************/

  /**
  * Switches mailbox
  * @param mailboxId: the id of the mailbox to switch to
  * @param serviceType=undefined: the type of service to also switch to if desired
  * @return this
  */
  switchMailbox (mailboxId, serviceType = undefined) {
    this.show().focus()
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_MAILBOX, {
      mailboxId: mailboxId,
      serviceType: serviceType
    })
    return this
  }

  /**
  * Switches to the previous mailbox
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchPrevMailbox (allowCycling = false) {
    this.show().focus()
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_MAILBOX, { prev: true, allowCycling: allowCycling })
    return this
  }

  /**
  * Switches to the next mailbox
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchNextMailbox (allowCycling = false) {
    this.show().focus()
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_MAILBOX, { next: true, allowCycling: allowCycling })
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
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_SERVICE, { index: index })
    return this
  }

  /**
  * Switches to the previous service
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchPrevService (allowCycling = false) {
    this.show().focus()
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_SERVICE, { prev: true, allowCycling: allowCycling })
    return this
  }

  /**
  * Switches to the next service
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  * @return this
  */
  switchNextService (allowCycling = false) {
    this.show().focus()
    this.window.webContents.send(WB_MAILBOXES_WINDOW_SWITCH_SERVICE, { next: true, allowCycling: allowCycling })
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
    this.window.webContents.send(WB_WINDOW_NAVIGATE_WEBVIEW_BACK, { })
    return this
  }

  /**
  * Tells the active mailbox to navigate back
  * @return this
  */
  navigateForward () {
    this.window.webContents.send(WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD, { })
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
    this.window.webContents.send(WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW, {})
  }

  /* ****************************************************************************/
  // Actions: Misc
  /* ****************************************************************************/

  /**
  * Changes the primary spell check lang. This is a bad call because really
  * we should have data access on the top level
  * @param lang: the language to change to
  */
  changePrimarySpellcheckLanguage (lang) {
    this.window.webContents.send(WB_MAILBOXES_WINDOW_CHANGE_PRIMARY_SPELLCHECK_LANG, { lang })
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused webcontents
  */
  focusedTabId () {
    return this.tabManager.getWebContentsId(
      mailboxStore.getActiveMailboxId(),
      mailboxStore.getActiveServiceType()
    )
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return this.tabManager.allWebContentIds()
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
