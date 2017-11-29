import { app, BrowserWindow, protocol, ipcMain } from 'electron'
import yargs from 'yargs'
import credentials from 'shared/credentials'
import WaveboxAppPrimaryMenu from './WaveboxAppPrimaryMenu'
import WaveboxAppGlobalShortcuts from './WaveboxAppGlobalShortcuts'
import settingStore from 'stores/settingStore'
import mailboxStore from 'stores/mailboxStore'
import userStore from 'stores/userStore'
import extensionStore from 'stores/extensionStore'
import ipcEvents from 'shared/ipcEvents'
import BasicHTTPAuthHandler from '../BasicHTTPAuthHandler'
import { HostedExtensionProvider, HostedExtensionSessionManager } from 'Extensions/Hosted'
import { CRExtensionManager } from 'Extensions/Chrome'
import { SessionManager, MailboxesSessionManager, ExtensionSessionManager } from '../SessionManager'
import ServicesManager from '../Services'
import MailboxesWindow from 'windows/MailboxesWindow'
import WaveboxWindow from 'windows/WaveboxWindow'
import AppUpdater from 'AppUpdater'
import WaveboxAppCloseBehaviour from './WaveboxAppCloseBehaviour'
import WaveboxDarwinDockBehaviour from './WaveboxDarwinDockBehaviour'
import WaveboxTrayBehaviour from './WaveboxTrayBehaviour'
import {evtMain} from 'AppEvents'
import {
  appStorage,
  avatarStorage,
  mailboxStorage,
  extensionStorage,
  settingStorage,
  userStorage
} from 'storage'

const privStarted = Symbol('privStarted')
const privArgv = Symbol('privArgv')
const privAppMenu = Symbol('privAppMenu')
const privGlobalShortcuts = Symbol('privGlobalShortcuts')
const privMainWindow = Symbol('privMainWindow')
const privCloseBehaviour = Symbol('privCloseBehaviour')

class WaveboxApp {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privStarted] = false
    this[privArgv] = undefined
    this[privAppMenu] = undefined
    this[privGlobalShortcuts] = undefined
    this[privMainWindow] = undefined
    this[privCloseBehaviour] = undefined
  }

  /**
  * Starts the app
  */
  start () {
    if (this[privStarted]) {
      throw new Error('App already started. Subsequent calls to start() are disallowed')
    }

    // Errors
    process.on('uncaughtException', (err) => {
      console.error(err)
      console.error(err.stack)
    })

    // State
    this[privStarted] = true
    this[privArgv] = yargs.parse(process.argv)

    // Component behaviour
    this[privCloseBehaviour] = new WaveboxAppCloseBehaviour()
    WaveboxTrayBehaviour.setup()
    if (process.platform === 'darwin') { WaveboxDarwinDockBehaviour.setup() }

    // Main window
    this[privMainWindow] = new MailboxesWindow()
    this[privCloseBehaviour].mainWindow = this[privMainWindow]
    this[privMainWindow].on('closed', () => {
      this[privMainWindow] = undefined
      this[privCloseBehaviour].mainWindow = undefined
      app.quit()
    })

    // Managers
    SessionManager.start()
    MailboxesSessionManager.start()
    ExtensionSessionManager.start()
    ServicesManager.load()

    // Start our stores
    appStorage.checkAwake()
    avatarStorage.checkAwake()
    mailboxStorage.checkAwake()
    extensionStorage.checkAwake()
    settingStorage.checkAwake()
    userStorage.checkAwake()
    mailboxStore.checkAwake()
    extensionStore.checkAwake()
    settingStore.checkAwake()
    userStore.checkAwake()

    // Setup the environment
    this._configureEnvironment()

    // Configure extensions
    CRExtensionManager.setup()
    protocol.registerStandardSchemes([].concat(
      HostedExtensionProvider.supportedProtocols,
      CRExtensionManager.supportedProtocols
    ), { secure: true })

    // App menus and shortcuts
    this[privAppMenu] = new WaveboxAppPrimaryMenu()
    this[privGlobalShortcuts] = new WaveboxAppGlobalShortcuts()

    // Binding
    this._bindIPCListeners()

    // App listeners
    app.on('ready', this._handleAppReady)
    app.on('window-all-closed', this._handleAllWindowsClosed)
    app.on('activate', this._handleActivate)
    app.on('before-quit', this._handleBeforeQuit)
    app.on('open-url', this._handleOpenUrl)
    app.on('login', this._handleHTTPBasicLogin)
    evtMain.on(evtMain.WB_QUIT_APP, this.fullyQuitApp)
  }

  /* ****************************************************************************/
  // Startup
  /* ****************************************************************************/

  /**
  * Configures the environment - including commandline switches etc
  */
  _configureEnvironment () {
    if (settingStore.app.ignoreGPUBlacklist) {
      app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
    }
    if (settingStore.app.disableSmoothScrolling) {
      app.commandLine.appendSwitch('disable-smooth-scrolling', 'true')
    }
    if (!settingStore.app.enableUseZoomForDSF) {
      app.commandLine.appendSwitch('enable-use-zoom-for-dsf', 'false')
    }
    if (settingStore.app.disableHardwareAcceleration) {
      app.disableHardwareAcceleration()
    }

    process.env.GOOGLE_API_KEY = credentials.GOOGLE_API_KEY
  }

  /* ****************************************************************************/
  // IPC
  /* ****************************************************************************/

  /**
  * Binds the IPC listeners
  */
  _bindIPCListeners () {
    ipcMain.on(ipcEvents.WB_FOCUS_APP, (evt, body) => {
      const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
      if (mailboxesWindow) {
        mailboxesWindow.focus()
      } else {
        const any = WaveboxWindow.all()
        if (any) {
          any.focus()
        }
      }
    })

    ipcMain.on(ipcEvents.WB_QUIT_APP, this.fullyQuitApp)
    ipcMain.on(ipcEvents.WB_RELAUNCH_APP, this.restartApp)

    ipcMain.on(ipcEvents.WB_SQUIRREL_UPDATE_CHECK, (evt, data) => {
      AppUpdater.updateCheck(data.url)
    })

    ipcMain.on(ipcEvents.WB_SQUIRREL_APPLY_UPDATE, (evt, body) => {
      this[privCloseBehaviour].prepareForQuit()
      AppUpdater.applySquirrelUpdate()
    })

    ipcMain.on(ipcEvents.WB_PREPARE_EXTENSION_SESSION, (evt, data) => {
      HostedExtensionSessionManager.startManagingSession(data.partition)
      evt.returnValue = true
    })

    ipcMain.on(ipcEvents.WB_MAILBOXES_WINDOW_JS_LOADED, (evt, data) => {
      if (this[privArgv].mailto) {
        this[privMainWindow].openMailtoLink(this[privArgv].mailto)
        delete this[privArgv].mailto
      } else {
        const index = this[privArgv]._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          this[privMainWindow].openMailtoLink(this[privArgv]._[index])
          this[privArgv]._.splice(1)
        }
      }
    })
  }

  /* ****************************************************************************/
  // App events
  /* ****************************************************************************/

  /**
  * Checks to see we should open hidden. This is a sync call down to the OS. Use sparingly
  * @return true if we should open hidden, false otherwise
  */
  _syncFetchShouldOpenHidden () {
    if (settingStore.ui.openHidden) { return true }
    if (this[privArgv].hidden || this[privArgv].hide) { return true }
    if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) { return true }
    return false
  }

  /**
  * Handles the app becoming ready
  */
  _handleAppReady = () => {
    // Load extensions before any webcontents get created
    if (settingStore.extension.enableChromeExperimental) {
      try {
        CRExtensionManager.loadExtensionDirectory()
      } catch (ex) {
        console.error(`Failed to load extensions. Continuing...`, ex)
      }
    }

    // Write any state
    settingStore.writeLaunchSettingsToRenderProcess()

    // Doing this outside of ready has a side effect on high-sierra where you get a _TSGetMainThread error
    // To resolve this, run it when in ready
    const openHidden = this._syncFetchShouldOpenHidden()

    // Prep app menu
    this[privAppMenu].updateApplicationMenu(
      settingStore.accelerators,
      mailboxStore.orderedMailboxes(),
      mailboxStore.getActiveMailbox(),
      mailboxStore.getActiveServiceType()
    )
    this[privMainWindow].create(openHidden)
    AppUpdater.register()
    this[privGlobalShortcuts].register()
  }

  /**
  * Handles all the windows closing
  */
  _handleAllWindowsClosed = () => {
    app.quit()
  }

  /**
  * Handles the activate call being sent (osx only)
  */
  _handleActivate = () => {
    this[privMainWindow].show()
  }

  /**
  * Handles the teardown before quit
  */
  _handleBeforeQuit = () => {
    this[privGlobalShortcuts].unregister()
    this[privCloseBehaviour].fullyQuitApp()
  }

  /**
  * Handles a url being requested to be opened (osx only)
  * @param evt: the event that fired
  * @param url: the url
  */
  _handleOpenUrl = (evt, url) => {
    evt.preventDefault()
    this[privMainWindow].openMailtoLink(url)
  }

  /**
  * Handles HTTP basic login requiest
  * @param evt: the event that fired
  * @param webContents: the requesting webcontents
  * @param request: the incoming request
  * @param authInfo: the authentication info
  * @param callback: the callback to fire on complete
  */
  _handleHTTPBasicLogin = (evt, webContents, request, authInfo, callback) => {
    evt.preventDefault()
    const handler = new BasicHTTPAuthHandler()
    const parentWindow = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents)
    handler.start(parentWindow, request, authInfo, callback)
  }

  /* ****************************************************************************/
  // App Lifecycle
  /* ****************************************************************************/

  /**
  * Fully quits the app
  */
  fullyQuitApp = () => { this[privCloseBehaviour].fullyQuitApp() }

  /**
  * Quits the app and then starts it up again
  */
  restartApp = () => { this[privCloseBehaviour].restartApp() }
}

export default new WaveboxApp()
