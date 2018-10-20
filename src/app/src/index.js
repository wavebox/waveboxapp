;(function () {
  const { app } = require('electron')
  const AppUpdater = require('AppUpdater').default

  // Squirrel startup calls
  if (AppUpdater.handleWin32SquirrelSwitches(app)) { return }

  // Ensure single instance
  const hasRunLock = app.requestSingleInstanceLock()
  if (hasRunLock) {
    const WaveboxApp = require('./WaveboxApp').default
    WaveboxApp.start()
  } else {
    app.quit()
  }
})()
