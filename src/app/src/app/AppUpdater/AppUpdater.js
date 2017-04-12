const { autoUpdater } = require('electron')
const path = require('path')
const ChildProcess = require('child_process')
const Win32Registry = require('./Win32Registry')
const pkg = require('../../package.json')
const fs = require('fs-extra')
const AppDirectory = require('appdirectory')

class AppUpdater {
  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  static get isSupportedPlatform () {
    return process.platform === 'darwin' || process.platform === 'win32'
  }

  /* ****************************************************************************/
  // Error detection
  /* ****************************************************************************/

  /**
  * @param ex: the thrown exception
  * @return true if it's a code signing failure that caused the exception
  */
  static isSigningFailureException (ex) {
    return ex.message.toLowerCase().indexOf('could not get code signature') !== -1
  }

  /* ****************************************************************************/
  // Registering
  /* ****************************************************************************/

  /**
  * Checks for updates
  * @param url: the url to set for the updater
  */
  static updateCheck (url) {
    if (!this.isSupportedPlatform) { return }

    try {
      autoUpdater.setFeedURL(url)
      autoUpdater.checkForUpdates()
    } catch (ex) {
      if (this.isSigningFailureException(ex)) {
        console.log('Autoupdater disabled:', ex.message)
      } else {
        throw ex
      }
    }
  }

  /**
  * Registers the app updater handlers
  * @param windowManager: the window manager instance
  * @return true if the platform was registered
  */
  static register (windowManager) {
    if (this.isSupportedPlatform) {
      try {
        autoUpdater.on('update-downloaded', (evt) => {
          windowManager.mailboxesWindow.squirrelUpdateDownloaded()
        })
        autoUpdater.on('error', (evt) => {
          if (this.isSigningFailureException(evt)) {
            console.log('Autoupdater disabled:', evt.message)
          } else {
            windowManager.mailboxesWindow.squirrelUpdateError()
          }
        })
        autoUpdater.on('update-available', (evt) => {
          windowManager.mailboxesWindow.squirrelUpdateAvailable()
        })
        autoUpdater.on('update-not-available', (evt) => {
          windowManager.mailboxesWindow.squirrelUpdateNotAvailable()
        })
        autoUpdater.on('checking-for-update', (evt) => {
          windowManager.mailboxesWindow.squirrelCheckingForUpdate()
        })

        return true
      } catch (ex) {
        if (this.isSigningFailureException(ex)) {
          console.log('Autoupdater disabled:', ex.message)
        } else {
          throw ex
        }
      }
    }

    return false
  }

  /* ****************************************************************************/
  // Applications
  /* ****************************************************************************/

  /**
  * Applies a squirrel update
  * @Param windowManager: the window manager
  */
  static applySquirrelUpdate (windowManager) {
    windowManager.forceQuit = true
    autoUpdater.quitAndInstall()
  }

  /* ****************************************************************************/
  // Handling updates: Win32
  /* ****************************************************************************/

  /**
  * Spawns a windows32 update
  * @param args: the arguments to pass to the update
  * @return the spawned process
  */
  static _spawnWin32Update (args) {
    const rootFolder = path.resolve(process.execPath, '../..')
    const updaterPath = path.resolve(path.join(rootFolder, 'Update.exe'))
    let spawnedProcess

    try {
      spawnedProcess = ChildProcess.spawn(updaterPath, args, { detached: true })
    } catch (error) {}

    return spawnedProcess
  }

  /**
  * Handles win32 squirrel switches
  * @param app: the electron app instance
  * @return true if a squirrel switch was handled, false otherwise
  */
  static handleWin32SquirrelSwitches (app) {
    if (process.platform !== 'win32') { return false }
    if (process.argv.length === 1) { return false }

    switch (process.argv[1]) {
      case '--squirrel-install':
      case '--squirrel-updated':
        AppUpdater._spawnWin32Update(['--createShortcut', path.basename(process.execPath)])
        Win32Registry.addManifestEntries(path.join(process.execPath, '../../Wavebox.exe'))
          .catch(() => Promise.resolve())
          .then(() => {
            setTimeout(app.quit, 1000)
          })
        AppUpdater.migrateWin32DatabaseLocation()
        return true
      case '--squirrel-uninstall':
        AppUpdater._spawnWin32Update(['--removeShortcut', path.basename(process.execPath)])
        Win32Registry.removeManifestEntries(path.join(process.execPath, '../../Wavebox.exe'))
          .catch(() => Promise.resolve())
          .then(() => {
            setTimeout(app.quit, 1000)
          })
        return true
      case '--squirrel-obsolete':
        app.quit()
        return true
      default:
        return false
    }
  }

  /* ****************************************************************************/
  // Migration
  /* ****************************************************************************/

  /**
  * Moves the databases on win32 from /local/ to /roaming/
  * @from 3.1.3-
  * @to 3.1.4+
  */
  migrateWin32DatabaseLocation () {
    try {
      const prevPath = new AppDirectory(pkg.name).userData()
      const nextPath = new AppDirectory({ appName: pkg.name, useRoaming: true }).userData()

      if (fs.existsSync(prevPath) && !fs.existsSync(nextPath)) {
        fs.moveSync(prevPath, nextPath)
      }
    } catch (ex) {
      console.warn('Failed to migrate Win32DatabaseLocation', ex)
    }
  }
}

module.exports = AppUpdater
