const alt = require('../alt')
const actions = require('./platformActions')
const { remote } = window.nativeRequire('electron')
const WinRegistry = process.platform === 'win32' ? window.appNodeModulesRequire('winreg') : null
const path = require('path')

const WIN32_LOGIN_PREF_MAX_AGE = 1000 * 30 // 30 secs
const WIN32_REG_PATH = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

class PlatformStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.win32LoginPrefs = {
      lastSynced: 0,
      openAtLogin: false,
      openAsHidden: false
    }

    /* ****************************************/
    // Open at login
    /* ****************************************/

    /**
    * @return true if login preferences are supported on this platform
    */
    this.loginPrefSupported = () => { return process.platform === 'darwin' || process.platform === 'win32' }

    /**
    * @return { openAtLogin, openAsHidden } or null if not supported / unknown
    */
    this.loginPref = () => {
      if (process.platform === 'darwin') {
        const settings = remote.app.getLoginItemSettings()
        return {
          openAtLogin: settings.openAtLogin,
          openAsHidden: settings.openAsHidden
        }
      } else if (process.platform === 'win32') {
        this.resyncWindowsLoginPref()
        return {
          openAtLogin: this.win32LoginPrefs.openAtLogin,
          openAsHidden: this.win32LoginPrefs.openAsHidden
        }
      } else {
        return null
      }
    }

    /**
    * @return { openAtLogin, openAsHidden }. If state is unknown assumes false for both
    */
    this.loginPrefAssumed = () => {
      const pref = this.loginPref()
      return pref === null ? { openAtLogin: false, openAsHidden: false } : pref
    }

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
  // Login utils
  /* **************************************************************************/

  /**
  * Resyncs the windows login pref if enough time has elapsed
  */
  resyncWindowsLoginPref () {
    const now = new Date().getTime()
    if (now - this.win32LoginPrefs.lastSynced < WIN32_LOGIN_PREF_MAX_AGE) { return }

    this.win32LoginPrefs.lastSynced = now
    const key = new WinRegistry({ hive: WinRegistry.HKCU, key: WIN32_REG_PATH })
    key.get('Wavebox', (err, item) => {
      if (err) {
        this.win32LoginPrefs.openAtLogin = false
        this.win32LoginPrefs.openAsHidden = false
      } else {
        this.win32LoginPrefs.openAtLogin = true
        this.win32LoginPrefs.openAsHidden = item.value.indexOf('--hidden') !== -1
      }
      this.emitChange()
    })
  }

  /* **************************************************************************/
  // Handlers: Login
  /* **************************************************************************/

  handleChangeLoginPref ({ openAtLogin, openAsHidden }) {
    if (process.platform === 'darwin') {
      remote.app.setLoginItemSettings({
        openAtLogin: openAtLogin,
        openAsHidden: openAsHidden
      })
    } else if (process.platform === 'win32') {
      const key = new WinRegistry({ hive: WinRegistry.HKCU, key: WIN32_REG_PATH })
      if (openAtLogin) {
        const value = [
          `"${path.join(process.execPath, '../../Wavebox.exe')}"`,
          openAsHidden ? '--hidden' : ''
        ].filter((c) => !!c).join(' ')
        key.set('Wavebox', WinRegistry.REG_SZ, value, (err) => {
          if (!err) {
            this.win32LoginPrefs.lastSynced = new Date().getTime()
            this.win32LoginPrefs.openAtLogin = true
            this.win32LoginPrefs.openAsHidden = openAsHidden
            this.emitChange()
          }
        })
      } else {
        key.remove('Wavebox', (err) => {
          if (!err) {
            this.win32LoginPrefs.lastSynced = new Date().getTime()
            this.win32LoginPrefs.openAtLogin = false
            this.win32LoginPrefs.openAsHidden = false
            this.emitChange()
          }
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

module.exports = alt.createStore(PlatformStore, 'PlatformStore')
