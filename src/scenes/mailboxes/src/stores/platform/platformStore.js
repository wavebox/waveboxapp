import alt from '../alt'
import actions from './platformActions'
import path from 'path'
import { remote } from 'electron'
import pkg from 'package.json'

const WinRegistry = process.platform === 'win32' ? window.appNodeModulesRequire('winreg') : null
const AutoLaunch = process.platform === 'darwin' ? window.appNodeModulesRequire('auto-launch') : null

const WIN32_REG_PATH = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
const darwinLaunchPath = process.platform === 'darwin' ? (() => {
  const execComponents = process.execPath.split(path.sep)
  const launchIndex = execComponents.findIndex((token) => token.indexOf('.app') !== -1)
  const launchPath = execComponents.slice(0, launchIndex + 1).join(path.sep)
  return launchPath
})() : null
const win32LaunchPath = process.platform === 'win32' ? (() => {
  return `${path.join(process.execPath, '../../Wavebox.exe')}`
})() : null

class PlatformStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    /* ****************************************/
    // Open at login
    /* ****************************************/

    /**
    * @return true if login preferences are supported on this platform
    */
    this.loginPrefSupported = () => { return process.platform === 'darwin' || process.platform === 'win32' }

    /* ****************************************/
    // Default Mail handler
    /* ****************************************/

    /**
    * @return true if the platform supports mailto
    */
    this.mailtoLinkHandlerSupported = () => { return process.platform === 'darwin' || process.platform === 'win32' }

    /**
    * @return true if this app is the default mailto link handler
    */
    this.isMailtoLinkHandler = () => {
      if (process.platform === 'darwin' || process.platform === 'win32') {
        return remote.app.isDefaultProtocolClient('mailto')
      } else {
        return false
      }
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleChangeLoginPref: actions.CHANGE_LOGIN_PREF,
      handleChangeMailtoLinkHandler: actions.CHANGE_MAILTO_LINK_HANDLER
    })
  }

  /* **************************************************************************/
  // Handlers: Login
  /* **************************************************************************/

  handleChangeLoginPref ({ openAtLogin, openAsHidden }) {
    if (process.platform === 'darwin') {
      const autoLaunch = new AutoLaunch({
        name: pkg.name,
        path: darwinLaunchPath,
        isHidden: openAsHidden
      })
      if (openAtLogin) {
        autoLaunch.enable().catch((err) => {
          console.error('Failed to configure autoLaunch', err)
        })
      } else {
        autoLaunch.disable().catch((err) => {
          console.error('Failed to configure autoLaunch', err)
        })
      }
    } else if (process.platform === 'win32') {
      const key = new WinRegistry({ hive: WinRegistry.HKCU, key: WIN32_REG_PATH })
      if (openAtLogin) {
        const value = [
          win32LaunchPath,
          openAsHidden ? '--hidden' : ''
        ].filter((c) => !!c).join(' ')
        key.set('Wavebox', WinRegistry.REG_SZ, value, (err) => {
          console.error('Failed to configure autoLaunch', err)
        })
      } else {
        key.remove('Wavebox', (err) => {
          console.error('Failed to configure autoLaunch', err)
        })
      }
    }
  }

  /* **************************************************************************/
  // Handlers: Mailto
  /* **************************************************************************/

  handleChangeMailtoLinkHandler ({ isCurrentApp }) {
    if (isCurrentApp) {
      remote.app.setAsDefaultProtocolClient('mailto')
    } else {
      remote.app.removeAsDefaultProtocolClient('mailto')
    }
  }
}

export default alt.createStore(PlatformStore, 'PlatformStore')
