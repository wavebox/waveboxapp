const alt = require('../alt')
const actions = require('./userActions')
const { ANALYTICS_ID, CREATED_TIME } = require('shared/Models/DeviceKeys')
const User = require('shared/Models/User')
const persistence = require('./userPersistence')
const Bootstrap = require('../../Bootstrap')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const { ipcRenderer } = window.nativeRequire('electron')

class UserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.clientId = null
    this.clientToken = null
    this.analyticsId = null
    this.createdTime = null
    this.account = null

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Store lifecycle
      handleLoad: actions.LOAD,

      handleRemoteChangeAccount: actions.REMOTE_CHANGE_ACCOUNT,

      handleAuthenticateWithMailbox: actions.AUTHENTICATE_WITH_MAILBOX,
      handleAuthenticateWithGoogle: actions.AUTHENTICATE_WITH_GOOGLE,
      handleAuthenticateWithMicrosoft: actions.AUTHENTICATE_WITH_MICROSOFT,

      handleAuthenticationSuccess: actions.AUTHENTICATION_SUCCESS,
      handleAuthenticationFailure: actions.AUTHENTICATION_FAILURE
    })
  }

  /* **************************************************************************/
  // Handlers: Store Lifecycle
  /* **************************************************************************/

  handleLoad () {
    const allData = persistence.allJSONItemsSync()
    this.clientId = Bootstrap.clientToken
    this.clientToken = Bootstrap.clientToken
    this.analyticsId = allData[ANALYTICS_ID]
    this.createdTime = allData[CREATED_TIME]
    this.user = new User(Bootstrap.accountJS)
  }

  /* **************************************************************************/
  // Handlers: Account
  /* **************************************************************************/

  handleRemoteChangeAccount ({ account }) {
    this.user = new User(account)
  }

  /* **************************************************************************/
  // Handlers: Auth
  /* **************************************************************************/

  handleAuthenticateWithMailbox ({ id, type, serverArgs }) {
    ipcRenderer.send('auth-wavebox', {
      id: id,
      type: type,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithGoogle ({ serverArgs }) {
    ipcRenderer.send('auth-wavebox', {
      id: null,
      type: CoreMailbox.MAILBOX_TYPES.GOOGLE,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithMicrosoft ({ serverArgs }) {
    ipcRenderer.send('auth-wavebox', {
      id: null,
      type: CoreMailbox.MAILBOX_TYPES.MICROSOFT,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs
    })
    window.location.hash = '/account/authenticating'
  }

  /* **************************************************************************/
  // Handlers: Auth Callbacks
  /* **************************************************************************/

  handleAuthenticationSuccess ({ id, type, next }) {
    if (next) {
      window.location.hash = `/account/view?url=${next}`
    } else {
      window.location.hash = '/account/view'
    }
  }

  handleAuthenticationFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }
}

module.exports = alt.createStore(UserStore, 'UserStore')
