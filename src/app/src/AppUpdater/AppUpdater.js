import { autoUpdater } from 'electron'
import path from 'path'
import ChildProcess from 'child_process'
import Win32Registry from './Win32Registry'
import AppUpdaterLog from './AppUpdaterLog'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'

const SQUIRREL_INSTALL_SWITCH = '--squirrel-install'
const SQUIRREL_UPDATE_SWITCH = '--squirrel-updated'
const SQUIRREL_UNINSTALL_SWITCH = '--squirrel-uninstall'
const SQUIRREL_OBSOLETE_SWITCH = '--squirrel-obsolete'

class AppUpdater {
  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  static get isSupportedPlatform () {
    return process.platform === 'darwin' || process.platform === 'win32'
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  static getMailboxesWindow () {
    return WaveboxWindow.getOfType(MailboxesWindow)
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
  * @return true if the platform was registered
  */
  static register () {
    if (this.isSupportedPlatform) {
      try {
        autoUpdater.on('update-downloaded', (evt) => {
          const mailboxesWindow = this.getMailboxesWindow()
          if (mailboxesWindow) {
            mailboxesWindow.squirrelUpdateDownloaded()
          }
        })
        autoUpdater.on('error', (evt) => {
          const mailboxesWindow = this.getMailboxesWindow()
          if (this.isSigningFailureException(evt)) {
            console.log('Autoupdater disabled:', evt.message)
            if (mailboxesWindow) {
              mailboxesWindow.squirrelUpdateDisabled()
            }
          } else {
            if (mailboxesWindow) {
              mailboxesWindow.squirrelUpdateError()
            }
          }
        })
        autoUpdater.on('update-available', (evt) => {
          const mailboxesWindow = this.getMailboxesWindow()
          if (mailboxesWindow) {
            mailboxesWindow.squirrelUpdateAvailable()
          }
        })
        autoUpdater.on('update-not-available', (evt) => {
          const mailboxesWindow = this.getMailboxesWindow()
          if (mailboxesWindow) {
            mailboxesWindow.squirrelUpdateNotAvailable()
          }
        })
        autoUpdater.on('checking-for-update', (evt) => {
          const mailboxesWindow = this.getMailboxesWindow()
          if (mailboxesWindow) {
            mailboxesWindow.squirrelCheckingForUpdate()
          }
        })

        return true
      } catch (ex) {
        if (this.isSigningFailureException(ex)) {
          console.log('Autoupdater disabled:', ex.message)
          const mailboxesWindow = this.getMailboxesWindow()
          if (mailboxesWindow) {
            mailboxesWindow.squirrelUpdateDisabled()
          }
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
  static applySquirrelUpdate () {
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

    const installSwitch = process.argv[1]
    const logger = new AppUpdaterLog()
    logger
      .log('--------------------')
      .log(`New Install Started. Switch: ${installSwitch}`)

    if (installSwitch === SQUIRREL_INSTALL_SWITCH || installSwitch === SQUIRREL_UPDATE_SWITCH) {
      if (installSwitch === SQUIRREL_INSTALL_SWITCH) {
        logger.log(`Create shortcuts`)
        AppUpdater._spawnWin32Update(['--createShortcut', path.basename(process.execPath)])
      }
      Win32Registry.addManifestEntries(path.join(process.execPath, '../../Wavebox.exe'))
        .then(
          () => logger.promiseLog(`Added Registry Entries`),
          (err) => logger.promiseLog(`Failed to add Registry Entries ${err}`)
        )
        .then(() => {
          logger.flush()
          setTimeout(app.quit, 1000)
        })
      return true
    } else if (installSwitch === SQUIRREL_UNINSTALL_SWITCH) {
      logger.log(`Remove shortcuts`)
      AppUpdater._spawnWin32Update(['--removeShortcut', path.basename(process.execPath)])
      Win32Registry.removeManifestEntries(path.join(process.execPath, '../../Wavebox.exe'))
        .then(
          () => logger.promiseLog(`Removed Registry Entries`),
          (err) => logger.promiseLog(`Failed to remove Registry Entries ${err}`)
        )
        .then(() => {
          logger.flush()
          setTimeout(app.quit, 1000)
        })
      return true
    } else if (installSwitch === SQUIRREL_OBSOLETE_SWITCH) {
      app.quit()
      return true
    } else {
      return false
    }
  }
}

export default AppUpdater
