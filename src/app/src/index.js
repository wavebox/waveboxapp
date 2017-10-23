;(function () {
  const { ipcMain, app } = require('electron')
  const AppUpdater = require('AppUpdater').default

  // Squirrel startup calls
  if (AppUpdater.handleWin32SquirrelSwitches(app)) { return }

  // Single app instance
  let appWindowManager
  const LinuxAppSingleton = require('./LinuxAppSingleton').default
  if (process.platform === 'linux') {
    const singleAppQuit = LinuxAppSingleton.makeSingleInstance(
      (commandLine, workingDirectory) => {
        if (appWindowManager && appWindowManager.mailboxesWindow) {
          appWindowManager.mailboxesWindow.window.show()
          appWindowManager.mailboxesWindow.window.focus()

          const AppSingleInstance = require('./AppSingleInstance').default
          AppSingleInstance.processSingleInstanceArgs(appWindowManager, commandLine, workingDirectory)
        }
      },
      () => { app.quit() }
    )
    if (singleAppQuit) { return }
  } else {
    const singleAppQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
      const AppSingleInstance = require('./AppSingleInstance').default
      AppSingleInstance.processSingleInstanceArgs(appWindowManager, commandLine, workingDirectory)
      return true
    })
    if (singleAppQuit) { app.quit(); return }
  }

  // Setup the window manager
  appWindowManager = require('./appWindowManager').default
  const MailboxesWindow = require('windows/MailboxesWindow').default
  appWindowManager.attachMailboxesWindow(new MailboxesWindow())

  // Startup
  const argv = require('yargs').parse(process.argv)
  const credentials = require('shared/credentials')
  const AppPrimaryMenu = require('./AppPrimaryMenu').default
  const AppGlobalShortcuts = require('./AppGlobalShortcuts').default
  const storage = require('storage')
  const settingStore = require('stores/settingStore').default
  const mailboxStore = require('stores/mailboxStore').default
  const userStore = require('stores/userStore').default
  const extensionStore = require('stores/extensionStore').default
  const ipcEvents = require('shared/ipcEvents')
  const BasicHTTPAuthHandler = require('./BasicHTTPAuthHandler').default
  const { HostedExtensionProvider, HostedExtensionSessionManager } = require('Extensions/Hosted')
  const { BrowserWindow, protocol } = require('electron')
  const { CRExtensionManager } = require('Extensions/Chrome')
  const { SpellcheckService, PDFRenderService } = require('./Services')
  const { SessionManager, MailboxesSessionManager } = require('./SessionManager')

  /* ****************************************************************************/
  // Managers
  /* ****************************************************************************/

  SessionManager.start()
  MailboxesSessionManager.start()

  /* ****************************************************************************/
  // Stores
  /* ****************************************************************************/

  Object.keys(storage).forEach((k) => storage[k].checkAwake())
  mailboxStore.checkAwake()
  extensionStore.checkAwake()
  settingStore.checkAwake()
  userStore.checkAwake()

  /* ****************************************************************************/
  // Commandline switches & Environment
  /* ****************************************************************************/

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

  /* ****************************************************************************/
  // Global objects
  /* ****************************************************************************/

  const shortcutSelectors = AppPrimaryMenu.buildSelectors(appWindowManager)
  const appMenu = new AppPrimaryMenu(shortcutSelectors)
  const appGlobalShortcutSelectors = AppGlobalShortcuts.buildSelectors(appWindowManager)
  const appGlobalShortcuts = new AppGlobalShortcuts(appGlobalShortcutSelectors)
  const spellcheckService = new SpellcheckService()
  spellcheckService.load()
  const pdfRenderService = new PDFRenderService()
  pdfRenderService.load()

  /* ****************************************************************************/
  // Extensions
  /* ****************************************************************************/

  CRExtensionManager.setup()
  protocol.registerStandardSchemes([].concat(
    HostedExtensionProvider.supportedProtocols,
    CRExtensionManager.supportedProtocols
  ), { secure: true })

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  ipcMain.on(ipcEvents.WB_OPEN_MONITOR_WINDOW, (evt, body) => {
    appWindowManager.openMonitorWindow()
  })

  ipcMain.on(ipcEvents.WB_PONG_RESOURCE_USAGE, (evt, body) => {
    appWindowManager.submitProcessResourceUsage(body)
  })

  ipcMain.on(ipcEvents.WB_FOCUS_APP, (evt, body) => {
    appWindowManager.focusMailboxesWindow()
  })

  ipcMain.on(ipcEvents.WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY, (evt, body) => {
    appWindowManager.toggleMailboxWindowVisibilityFromTray()
  })

  ipcMain.on(ipcEvents.WB_SHOW_MAILBOX_WINDOW_FROM_TRAY, (evt, body) => {
    appWindowManager.showMailboxWindowFromTray()
  })

  ipcMain.on(ipcEvents.WB_QUIT_APP, (evt, body) => {
    appWindowManager.quit()
  })

  ipcMain.on(ipcEvents.WB_RELAUNCH_APP, (evt, body) => {
    app.relaunch()
    appWindowManager.quit()
  })

  ipcMain.on(ipcEvents.WB_SQUIRREL_UPDATE_CHECK, (evt, data) => {
    AppUpdater.updateCheck(data.url)
  })

  ipcMain.on(ipcEvents.WB_SQUIRREL_APPLY_UPDATE, (evt, body) => {
    AppUpdater.applySquirrelUpdate(appWindowManager)
  })

  ipcMain.on(ipcEvents.WB_PREPARE_EXTENSION_SESSION, (evt, data) => {
    HostedExtensionSessionManager.startManagingSession(data.partition)
    evt.returnValue = true
  })

  ipcMain.on(ipcEvents.WB_MAILBOXES_WINDOW_JS_LOADED, (evt, data) => {
    if (argv.mailto) {
      appWindowManager.mailboxesWindow.openMailtoLink(argv.mailto)
      delete argv.mailto
    } else {
      const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
      if (index !== -1) {
        appWindowManager.mailboxesWindow.openMailtoLink(argv._[index])
        argv._.splice(1)
      }
    }
  })

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  app.on('ready', () => {
    // Load extensions before any webcontents get created
    if (settingStore.extension.enableChromeExperimental) {
      try {
        CRExtensionManager.loadExtensionDirectory()
      } catch (ex) {
        console.error(`Failed to load extensions. Continuing...`, ex)
      }
    }

    // Doing this outside of ready has a side effect on high-sierra where you get a _TSGetMainThread error
    // To resolve this, run it when in ready
    const openHidden = (function () {
      if (settingStore.ui.openHidden) { return true }
      if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) { return true }
      if (argv.hidden || argv.hide) { return true }
      return false
    })()

    // Prep app menu
    appMenu.updateApplicationMenu(
      settingStore.accelerators,
      mailboxStore.orderedMailboxes(),
      mailboxStore.getActiveMailbox(),
      mailboxStore.getActiveServiceType()
    )
    appWindowManager.mailboxesWindow.create(openHidden)
    AppUpdater.register(appWindowManager)
    appGlobalShortcuts.register()
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    appWindowManager.mailboxesWindow.show()
  })

  app.on('before-quit', () => {
    appGlobalShortcuts.unregister()
    appWindowManager.forceQuit = true

    if (process.platform === 'linux') {
      LinuxAppSingleton.teardown()
    }
  })

  app.on('open-url', (evt, url) => { // osx only
    evt.preventDefault()
    appWindowManager.mailboxesWindow.openMailtoLink(url)
  })

  app.on('login', (evt, webContents, request, authInfo, callback) => {
    evt.preventDefault()
    const handler = new BasicHTTPAuthHandler()
    const parentWindow = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents)
    handler.start(parentWindow, request, authInfo, callback)
  })

  if (process.platform === 'darwin') {
    app.on('browser-window-blur', () => {
      appWindowManager.updateDarwinDock()
    })
  }

  if (process.platform === 'darwin') {
    app.on('browser-window-focus', () => {
      appWindowManager.updateDarwinDock()
    })
  }

  /* ****************************************************************************/
  // Exceptions
  /* ****************************************************************************/

  // Send crash reports
  process.on('uncaughtException', (err) => {
    console.error(err)
    console.error(err.stack)
  })
})()
