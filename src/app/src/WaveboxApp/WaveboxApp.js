/* global __DEV__ */

import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import yargs from 'yargs'
import credentials from 'shared/credentials'
import WaveboxAppPrimaryMenu from './WaveboxAppPrimaryMenu'
import WaveboxAppGlobalShortcuts from './WaveboxAppGlobalShortcuts'
import { settingsStore, settingsActions } from 'stores/settings'
import { platformStore, platformActions } from 'stores/platform'
import { accountStore, accountActions } from 'stores/account'
import { userStore, userActions } from 'stores/user'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { notifhistStore, notifhistActions } from 'stores/notifhist'
import { guestStore, guestActions } from 'stores/guest'
import ipcEvents from 'shared/ipcEvents'
import BasicHTTPAuthHandler from '../BasicHTTPAuthHandler'
import { CRExtensionManager } from 'Extensions/Chrome'
import { SessionManager, AccountSessionManager, ExtensionSessionManager } from '../SessionManager'
import ServicesManager from '../Services'
import MailboxesWindow from 'Windows/MailboxesWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import AppUpdater from 'AppUpdater'
import WaveboxAppCloseBehaviour from './WaveboxAppCloseBehaviour'
import WaveboxDarwinDockBehaviour from './WaveboxDarwinDockBehaviour'
import {evtMain} from 'AppEvents'
import {TrayPopout, TrayBehaviour} from 'Tray'
import {LinuxNotification} from 'Notifications'
import WaveboxCommandArgs from './WaveboxCommandArgs'
import { AppSettings } from 'shared/Models/Settings'
import WaveboxDataManager from './WaveboxDataManager'
import mailboxStorage from 'Storage/mailboxStorage'

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
    // Some 3rd party libraries (hunspell) bind uncaughtException and can kill
    // the app. Prevent anyone else binding into uncaughtException so we can protect
    // against this
    process.__on_unsafe__ = process.on
    process.on = (...args) => {
      if (args[0] === 'uncaughtException') {
        let isDev
        try {
          isDev = __DEV__
        } catch (ex) {
          isDev = true
        }

        if (isDev) {
          console.log([
            'Wavebox is refusing to bind the "uncaughtException" event to process.',
            '  If you really meant to do this use "process.__on_unsafe__()"',
            '  This message will not be displayed in production'
          ].join('\n'))
        }
      } else {
        process.__on_unsafe__(...args)
      }
    }
    process.__on_unsafe__('uncaughtException', (err) => {
      console.error(err)
      console.error(err.stack)
    })

    // State
    this[privStarted] = true
    this[privArgv] = yargs.parse(process.argv)

    // Do any data migration
    mailboxStorage.startMigration()

    // Start our stores
    accountStore.getState()
    accountActions.load()
    settingsStore.getState()
    settingsActions.load()
    platformStore.getState()
    platformActions.load()
    userStore.getState()
    userActions.load()
    emblinkStore.getState()
    emblinkActions.load()
    notifhistStore.getState()
    notifhistActions.load()
    guestStore.getState()
    guestActions.load()

    // Component behaviour
    this[privCloseBehaviour] = new WaveboxAppCloseBehaviour()
    TrayBehaviour.setup()
    if (process.platform === 'darwin') { WaveboxDarwinDockBehaviour.setup() }

    // Main window
    this[privMainWindow] = new MailboxesWindow()
    this[privCloseBehaviour].mainWindow = this[privMainWindow]
    this[privMainWindow].on('closed', () => {
      this[privMainWindow] = undefined
      this[privCloseBehaviour].mainWindow = undefined
      this[privCloseBehaviour].safeQuitApp()
    })

    // Managers
    SessionManager.start()
    AccountSessionManager.start()
    ExtensionSessionManager.start()
    ServicesManager.load()

    // Setup the environment
    this._configureEnvironment()

    // Configure extensions
    CRExtensionManager.setup()
    // Electron registers chrome-extension by default so we don't need to do it
    // protocol.registerStandardSchemes([].concat(
    //   CRExtensionManager.supportedProtocols
    // ), { secure: true })

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
    app.on('will-quit', this._handleWillQuit)
    evtMain.on(evtMain.WB_QUIT_APP, this.fullyQuitApp)
    evtMain.on(evtMain.WB_RELAUNCH_APP, this.restartApp)
  }

  /* ****************************************************************************/
  // Startup
  /* ****************************************************************************/

  /**
  * Configures the environment - including commandline switches etc
  */
  _configureEnvironment () {
    const launchSettings = settingsStore.getState().launched
    if (launchSettings.app.ignoreGPUBlacklist) {
      app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
    }
    if (launchSettings.app.disableSmoothScrolling) {
      app.commandLine.appendSwitch('disable-smooth-scrolling', 'true')
    }
    if (!launchSettings.app.enableUseZoomForDSF) {
      app.commandLine.appendSwitch('enable-use-zoom-for-dsf', 'false')
    }
    if (launchSettings.app.disableHardwareAcceleration) {
      app.disableHardwareAcceleration()
    }

    process.env.GOOGLE_API_KEY = credentials.GOOGLE_API_KEY

    if (AppSettings.SUPPORTS_MIXED_SANDBOX_MODE) {
      if (launchSettings.app.enableMixedSandboxMode) {
        app.enableMixedSandbox()
      }
    }
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
        mailboxesWindow.show()
        mailboxesWindow.focus()
      } else {
        const any = WaveboxWindow.all()
        if (any) {
          any.show()
          any.focus()
        }
      }
    })

    ipcMain.on(ipcEvents.WB_QUIT_APP, this.fullyQuitApp)
    ipcMain.on(ipcEvents.WB_RELAUNCH_APP, this.restartApp)
    ipcMain.on(ipcEvents.WB_CLEAN_EXPIRED_SESSIONS, () => WaveboxDataManager.cleanExpiredSessions())

    ipcMain.on(ipcEvents.WB_SQUIRREL_UPDATE_CHECK, (evt, data) => {
      AppUpdater.updateCheck(data.url)
    })

    ipcMain.on(ipcEvents.WB_SQUIRREL_APPLY_UPDATE, (evt, body) => {
      this[privCloseBehaviour].prepareForQuit()
      AppUpdater.applySquirrelUpdate()
    })

    ipcMain.on(ipcEvents.WB_MAILBOXES_WINDOW_JS_LOADED, (evt, data) => {
      if (this[privArgv].mailto) {
        emblinkActions.composeNewMailtoLink(this[privArgv].mailto)
        delete this[privArgv].mailto
      } else {
        const index = this[privArgv]._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          emblinkActions.composeNewMailtoLink(this[privArgv]._[index])
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
    if (settingsStore.getState().ui.openHidden) { return true }
    if (this[privArgv].hidden || this[privArgv].hide) { return true }
    if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) { return true }
    return false
  }

  /**
  * Handles the app becoming ready
  */
  _handleAppReady = () => {
    const settingsState = settingsStore.getState()
    const accountState = accountStore.getState()
    const userState = userStore.getState()

    // Load extensions before any webcontents get created
    try {
      CRExtensionManager.loadExtensionDirectory()
    } catch (ex) {
      console.error(`Failed to load extensions. Continuing...`, ex)
    }

    // Doing this outside of ready has a side effect on high-sierra where you get a _TSGetMainThread error
    // To resolve this, run it when in ready
    const openHidden = this._syncFetchShouldOpenHidden()

    // Prep app menu
    this[privAppMenu].updateApplicationMenu(
      settingsState.accelerators,
      this[privAppMenu].buildMailboxMenuConfig(accountState),
      userState.user.userEmail
    )

    // Create UI
    this[privMainWindow].create(openHidden)
    TrayPopout.load()
    LinuxNotification.load()

    // Check for updates
    AppUpdater.register()

    // Register global items
    this[privGlobalShortcuts].register()

    // Proces any user arguments
    WaveboxCommandArgs.processModifierArgs(this[privArgv], emblinkActions, accountActions)
  }

  /**
  * Handles all the windows closing
  */
  _handleAllWindowsClosed = () => {
    this[privCloseBehaviour].safeQuitApp()
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
    this[privCloseBehaviour].setAppInTeardownStage()

    this[privGlobalShortcuts].unregister()
    TrayPopout.unload()
    this[privCloseBehaviour].prepareForQuit()
  }

  /**
  * Handles a url being requested to be opened (osx only)
  * @param evt: the event that fired
  * @param url: the url
  */
  _handleOpenUrl = (evt, url) => {
    evt.preventDefault()
    emblinkActions.composeNewMailtoLink(url)
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

  /**
  * Handles the app preparing to quit
  */
  _handleWillQuit = () => {
    this[privCloseBehaviour].setAppInTeardownStage()

    globalShortcut.unregisterAll()
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
