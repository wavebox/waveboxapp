import alt from '../alt'
import actions from './userActions'
import User from 'shared/Models/User'
import persistence from './userPersistence'
import Bootstrap from '../../Bootstrap'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import semver from 'semver'
import { ipcRenderer } from 'electron'
import pkg from 'package.json'
import {
  ANALYTICS_ID,
  CREATED_TIME,
  USER,
  USER_EPOCH,
  EXTENSIONS,
  WIRE_CONFIG
} from 'shared/Models/DeviceKeys'
import {
  EXTENSION_AUTO_UPDATE_INTERVAL,
  WIRE_CONFIG_AUTO_UPDATE_INTERVAL
} from 'shared/constants'
import {
  WB_AUTH_WAVEBOX,
  WB_UPDATE_INSTALLED_EXTENSIONS
} from 'shared/ipcEvents'

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
    this.extensionAutoUpdater = null
    this.wireConfig = null
    this.wireConfigAutoUpdater = null

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
    // Wire config
    /* ****************************************/

    /**
    * @return true if we have wire config, false otherwise
    */
    this.hasWireConfig = () => { return !!this.wireConfig }

    /**
    * @return the wire config version or 0.0.0
    */
    this.wireConfigVersion = () => { return (this.wireConfig || {}).version || '0.0.0' }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Store lifecycle
      handleLoad: actions.LOAD,

      // Extensions
      handleUpdateExtensions: actions.UPDATE_EXTENSIONS,
      handleStartAutoUpdateExtensions: actions.START_AUTO_UPDATE_EXTENSIONS,
      handleStopAutoupdateExtensions: actions.STOP_AUTO_UPDATE_EXTENSIONS,

      // Wire Config
      handleUpdateWireConfig: actions.UPDATE_WIRE_CONFIG,
      handleStartAutoUpdateWireConfig: actions.START_AUTO_UPDATE_WIRE_CONFIG,
      handleStopAutoUpdateWireConfig: actions.STOP_AUTO_UPDATE_WIRE_CONFIG,

      // Remote changes
      handleRemoteChangeAccount: actions.REMOTE_CHANGE_ACCOUNT,

      // Auth
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

    // Extensions
    this.extensions = allData[EXTENSIONS] || null

    // Wire Config
    this.wireConfig = allData[WIRE_CONFIG] || null
  }

  /* **************************************************************************/
  // Handlers: Extensions
  /* **************************************************************************/

  handleUpdateExtensions () {
    this.preventDefault()
    Promise.resolve()
      .then(() => window.fetch(`https://waveboxio.com/client/${this.clientId}/extensions.json?version=${pkg.version}&channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        this.extensions = res
        persistence.setJSONItem(EXTENSIONS, res)
        ipcRenderer.send(WB_UPDATE_INSTALLED_EXTENSIONS, {})
        this.emitChange()
      })
  }

  handleStartAutoUpdateExtensions () {
    actions.updateExtensions.defer()

    if (this.extensionAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.extensionAutoUpdater = setInterval(() => {
      actions.updateExtensions()
    }, EXTENSION_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoupdateExtensions () {
    clearInterval(this.extensionAutoUpdater)
    this.extensionAutoUpdater = null
  }

  /* **************************************************************************/
  // Handlers: Wire Config
  /* **************************************************************************/

  handleUpdateWireConfig () {
    this.preventDefault()
    Promise.resolve()
      .then(() => window.fetch(`https://waveboxio.com/client/${this.clientId}/wire.json?version=${pkg.version}&channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        try {
          if (!semver.gt(res.version, this.wireConfigVersion())) { return }
        } catch (ex) {
          return
        }

        this.wireConfig = res
        persistence.setJSONItem(WIRE_CONFIG, res)
        this.emitChange()
      })
  }

  handleStartAutoUpdateWireConfig () {
    actions.updateWireConfig.defer()

    if (this.wireConfigAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.wireConfigAutoUpdater = setInterval(() => {
      actions.updateWireConfig()
    }, WIRE_CONFIG_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoUpdateWireConfig () {
    clearInterval(this.wireConfigAutoUpdater)
    this.wireConfigAutoUpdater = null
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
