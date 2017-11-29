;(function () {
  const { app } = require('electron')
  const AppUpdater = require('AppUpdater').default

  // Squirrel startup calls
  if (AppUpdater.handleWin32SquirrelSwitches(app)) { return }

  // Single app instance
  const singleAppQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    // Late require all of these...
    const AppSingleInstance = require('./AppSingleInstance').default
    const WaveboxWindow = require('windows/WaveboxWindow').default
    const MailboxesWindow = require('windows/MailboxesWindow').default
    const mainWindow = WaveboxWindow.getOfType(MailboxesWindow)
    AppSingleInstance.processSingleInstanceArgs(mainWindow, commandLine, workingDirectory)
    return true
  })
  if (singleAppQuit) { app.quit(); return }

  const WaveboxApp = require('./WaveboxApp').default
  WaveboxApp.start()
})()
