import alt from '../alt'
import actions from './userActions'
import { ANALYTICS_ID, CREATED_TIME, USER, USER_EPOCH, EXTENSIONS } from 'shared/Models/DeviceKeys'
import User from 'shared/Models/User'
import persistence from './userPersistence'
import Bootstrap from '../../Bootstrap'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import { WB_AUTH_WAVEBOX } from 'shared/ipcEvents'
import semver from 'semver'
import { ipcRenderer } from 'electron'
import pkg from 'package.json'

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
    this.extensions = null

    /* ****************************************/
    // Extensions
    /* ****************************************/

    /**
    * @return all the extensions
    */
    this.extensionList = () => { return this.extensions || [] }

    /**
    * @return all the extensions supported in this version
    */
    this.supportedExtensionList = () => {
      return this.extensionList().filter((ext) => {
        try {
          return semver.gte(pkg.version, ext.minVersion)
        } catch (ex) {
          return false
        }
      })
    }

    /**
    * @return all the extensions supported in this version, indexed by id
    */
    this.supportedExtensionsIndex = () => {
      return this.supportedExtensionList().reduce((acc, ext) => {
        acc[ext.id] = ext
        return acc
      }, {})
    }

    /**
    * @param extensionId: the id of the extension
    * @return the extension
    */
    this.getExtension = (extensionId) => {
      return this.extensionList().find((ext) => ext.id === extensionId)
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Store lifecycle
      handleLoad: actions.LOAD,
      handleLoadExtensions: actions.LOAD_EXTENSIONS,

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

    // Instance
    this.clientId = Bootstrap.clientToken
    this.clientToken = Bootstrap.clientToken
    this.analyticsId = allData[ANALYTICS_ID]
    this.createdTime = allData[CREATED_TIME]

    // User
    const now = new Date().getTime()
    persistence.setJSONItem(USER_EPOCH, now)
    persistence.setJSONItem(USER, Bootstrap.accountJS)
    this.user = new User(Bootstrap.accountJS, now)
  }

  handleLoadExtensions () {
    Promise.resolve()
      .then(() => window.fetch(`https://wavebox.io/client/${this.clientId}/extensions.json`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        this.extensions = res
        persistence.setJSONItem(EXTENSIONS, res)
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Account
  /* **************************************************************************/

  handleRemoteChangeAccount ({ account }) {
    const now = new Date().getTime()
    persistence.setJSONItem(USER_EPOCH, now)
    persistence.setJSONItem(USER, account)
    this.user = new User(account, now)
  }

  /* **************************************************************************/
  // Handlers: Auth
  /* **************************************************************************/

  handleAuthenticateWithMailbox ({ id, type, serverArgs }) {
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      id: id,
      type: type,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithGoogle ({ serverArgs }) {
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      id: null,
      type: CoreMailbox.MAILBOX_TYPES.GOOGLE,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithMicrosoft ({ serverArgs }) {
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
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
      window.location.hash = `/account/view?url=${encodeURIComponent(next)}`
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

export default alt.createStore(UserStore, 'UserStore')
