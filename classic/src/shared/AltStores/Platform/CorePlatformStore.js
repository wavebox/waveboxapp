import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltPlatformIdentifiers'
import electron from 'electron'

class CorePlatformStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.installMethod = 'unknown'

    /* ****************************************/
    // Open at login
    /* ****************************************/

    /**
    * @return true if login preferences are supported on this platform
    */
    this.loginPrefSupported = () => {
      if (process.platform === 'darwin' || process.platform === 'win32') {
        return true
      } else if (process.platform === 'linux' && this.installMethod !== 'snap') {
        return true
      } else {
        return false
      }
    }

    /* ****************************************/
    // Default Mail handler
    /* ****************************************/

    /**
    * @return true if the platform supports mailto
    */
    this.mailtoLinkHandlerSupported = () => this.loginPrefSupported()

    /**
    * @return true if this app is the default mailto link handler
    */
    this.isMailtoLinkHandler = () => {
      if (this.mailtoLinkHandlerSupported()) {
        if (process.type === 'browser') {
          return electron.app.isDefaultProtocolClient('mailto')
        } else if (process.type === 'renderer') {
          return electron.remote.app.isDefaultProtocolClient('mailto')
        } else {
          return false
        }
      } else {
        return false
      }
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad ({ installMethod }) {
    this.installMethod = installMethod

    this.__isStoreLoaded__ = true
  }
}

export default CorePlatformStore
