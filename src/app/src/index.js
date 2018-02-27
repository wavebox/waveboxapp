;(function () {
  const { app } = require('electron')
  const AppUpdater = require('AppUpdater').default

  // Squirrel startup calls
  if (AppUpdater.handleWin32SquirrelSwitches(app)) { return }

  // Single app instance
  const singleAppQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    const AppSingleInstance = require('./AppSingleInstance').default // Late require me
    AppSingleInstance.processSingleInstanceArgs(commandLine, workingDirectory)
    return true
  })
  if (singleAppQuit) { app.quit(); return }

  const WaveboxApp = require('./WaveboxApp').default
  WaveboxApp.start()
})()
