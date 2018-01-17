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

  handleLoad () { /* no-op */ }
}

export default CorePlatformStore
