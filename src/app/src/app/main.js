;(function () {
  const { ipcMain, app } = require('electron')
  const AppUpdater = require('./AppUpdater')

  // Squirrel startup calls
  if (AppUpdater.handleWin32SquirrelSwitches(app)) { return }

  // Single app instance
  let windowManager
  const singleAppQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    const AppSingleInstance = require('./AppSingleInstance')
    AppSingleInstance.processSingleInstanceArgs(windowManager, commandLine, workingDirectory)
    return true
  })
  if (singleAppQuit) { app.quit(); return }

  const argv = require('yargs').parse(process.argv)
  const MailboxesWindow = require('./windows/MailboxesWindow')
  const ContentWindow = require('./windows/ContentWindow')
  const AppPrimaryMenu = require('./AppPrimaryMenu')
  const AppKeyboardShortcuts = require('./AppKeyboardShortcuts')
  const WindowManager = require('./windows/WindowManager')
  const storage = require('./storage')
  const settingStore = require('./stores/settingStore')
  const mailboxStore = require('./stores/mailboxStore')
  const userStore = require('./stores/userStore')

  Object.keys(storage).forEach((k) => storage[k].checkAwake())
  mailboxStore.checkAwake()
  settingStore.checkAwake()
  userStore.checkAwake()

  /* ****************************************************************************/
  // Commandline switches & launch args
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
  const openHidden = (function () {
    if (settingStore.ui.openHidden) { return true }
    if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) { return true }
    if (argv.hidden || argv.hide) { return true }
    return false
  })()

  /* ****************************************************************************/
  // Global objects
  /* ****************************************************************************/

  const mailboxesWindow = new MailboxesWindow()
  windowManager = new WindowManager(mailboxesWindow)
  const shortcutSelectors = AppPrimaryMenu.buildSelectors(windowManager)
  const appMenu = new AppPrimaryMenu(shortcutSelectors)
  const appKeyboardShortcuts = new AppKeyboardShortcuts(shortcutSelectors)

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  ipcMain.on('new-window', (evt, body) => {
    const window = new ContentWindow()
    windowManager.addContentWindow(window)
    window.start(body.url, body.partition, windowManager.mailboxesWindow.window)
  })

  ipcMain.on('focus-app', (evt, body) => {
    windowManager.focusMailboxesWindow()
  })

  ipcMain.on('toggle-mailbox-visibility-from-tray', (evt, body) => {
    windowManager.toggleMailboxWindowVisibilityFromTray()
  })

  ipcMain.on('show-mailbox-from-tray', (evt, body) => {
    windowManager.showMailboxWindowFromTray()
  })

  ipcMain.on('quit-app', (evt, body) => {
    windowManager.quit()
  })

  ipcMain.on('relaunch-app', (evt, body) => {
    app.relaunch()
    windowManager.quit()
  })

  ipcMain.on('squirrel-update-check', (evt, data) => {
    AppUpdater.updateCheck(data.url)
  })

  ipcMain.on('squirrel-apply-update', (evt, body) => {
    AppUpdater.applySquirrelUpdate(windowManager)
  })

  ipcMain.on('prepare-webview-session', (evt, data) => {
    mailboxesWindow.sessionManager.startManagingSession(data.partition, data.mailboxType)
    evt.returnValue = true
  })

  ipcMain.on('mailboxes-js-loaded', (evt, data) => {
    if (argv.mailto) {
      windowManager.mailboxesWindow.openMailtoLink(argv.mailto)
      delete argv.mailto
    } else {
      const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
      if (index !== -1) {
        windowManager.mailboxesWindow.openMailtoLink(argv._[index])
        argv._.splice(1)
      }
    }
  })

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  app.on('ready', () => {
    appMenu.updateApplicationMenu(
      mailboxStore.orderedMailboxes(),
      mailboxStore.getActiveMailbox(),
      mailboxStore.getActiveServiceType()
    )
    windowManager.mailboxesWindow.start(openHidden)
    AppUpdater.register(windowManager)
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    windowManager.mailboxesWindow.show()
  })

  app.on('before-quit', () => {
    appKeyboardShortcuts.unregister()
    windowManager.forceQuit = true
  })

  app.on('open-url', (evt, url) => { // osx only
    evt.preventDefault()
    windowManager.mailboxesWindow.openMailtoLink(url)
  })

  app.on('browser-window-focus', () => {
    appKeyboardShortcuts.register()
  })

  app.on('browser-window-blur', () => {
    appKeyboardShortcuts.unregister()
  })

  /* ****************************************************************************/
  // Exceptions
  /* ****************************************************************************/

  // Send crash reports
  process.on('uncaughtException', (err) => {
    console.error(err)
    console.error(err.stack)
  })
})()
