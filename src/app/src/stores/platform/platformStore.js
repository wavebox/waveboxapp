import CorePlatformStore from 'shared/AltStores/Platform/CorePlatformStore'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/Platform/AltPlatformIdentifiers'
import actions from './platformActions'
import path from 'path'
import pkg from 'package.json'
import electron from 'electron'

const WinRegistry = process.platform === 'win32' ? require('winreg') : null
const AutoLaunch = process.platform === 'darwin' ? require('auto-launch') : null

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

class PlatformStore extends CorePlatformStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
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
      electron.app.setAsDefaultProtocolClient('mailto')
    } else {
      electron.app.removeAsDefaultProtocolClient('mailto')
    }
    this.dispatchToRemote('remoteEmitChange', [])
  }
}

export default alt.createStore(PlatformStore, STORE_NAME)
