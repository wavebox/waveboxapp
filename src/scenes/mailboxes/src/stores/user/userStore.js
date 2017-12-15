import alt from '../alt'
import actions from './userActions'
import User from 'shared/Models/User'
import userPersistence from './userPersistence'
import containerPersistence from './containerPersistence'
import extensionStorePersistence from './extensionStorePersistence'
import wirePersistence from './wirePersistence'
import mailboxActions from '../mailbox/mailboxActions'
import Bootstrap from '../../Bootstrap'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import semver from 'semver'
import { ipcRenderer } from 'electron'
import Container from 'shared/Models/Container/Container'
import { WaveboxHTTP } from 'Server'
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
    this.containers = new Map()
    this.containerAutoUpdater = null

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

    /**
    * @return the wire config experiments dictionary
    */
    this.wireConfigExperiments = () => { return (this.wireConfig || {}).experiments || {} }

    /* ****************************************/
    // Containers
    /* ****************************************/

    /**
    * @param containerId: the id of the container
    * @return the container or null
    */
    this.getContainer = (containerId) => { return this.containers.get(containerId) || null }

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

      // Containers
      handleUpdateContainers: actions.UPDATE_CONTAINERS,
      handleStartAutoUpdateContainers: actions.START_AUTO_UPDATE_CONTAINERS,
      handleStopAutoUpdateContainers: actions.STOP_AUTO_UPDATE_CONTAINERS,
      handleAddContainer: actions.ADD_CONTAINER,

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
    const allUserData = userPersistence.allJSONItemsSync()
    const allContainerData = containerPersistence.allJSONItemsSync()
    const allExtensionStoreData = extensionStorePersistence.allJSONItemsSync()
    const allWireConfigData = wirePersistence.allJSONItemsSync()

    // Instance
    this.clientId = Bootstrap.clientId
    this.clientToken = Bootstrap.clientToken
    this.analyticsId = allUserData[ANALYTICS_ID]
    this.createdTime = allUserData[CREATED_TIME]

    // User
    const now = new Date().getTime()
    userPersistence.setJSONItem(USER_EPOCH, now)
    userPersistence.setJSONItem(USER, Bootstrap.accountJS)
    this.user = new User(Bootstrap.accountJS, now)

    // Extensions
    this.extensions = allExtensionStoreData[EXTENSIONS] || null

    // Wire Config
    this.wireConfig = allWireConfigData[WIRE_CONFIG] || null

    // Containers
    this.containers = Object.keys(allContainerData).reduce((acc, id) => {
      acc.set(id, new Container(id, allContainerData[id]))
      return acc
    }, new Map())
  }

  /* **************************************************************************/
  // Handlers: Extensions
  /* **************************************************************************/

  handleUpdateExtensions () {
    this.preventDefault()

    WaveboxHTTP.fetchExtensionInfo(this.clientId)
      .then((res) => {
        this.extensions = res
        extensionStorePersistence.setJSONItem(EXTENSIONS, res)
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

    WaveboxHTTP.fetchWireConfig(this.clientId)
      .then((res) => {
        try {
          if (!semver.gt(res.version, this.wireConfigVersion())) { return }
        } catch (ex) {
          return
        }

        this.wireConfig = res
        wirePersistence.setJSONItem(WIRE_CONFIG, res)
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
  // Handlers: Containers
  /* **************************************************************************/

  handleUpdateContainers () {
    this.preventDefault()
    if (this.containers.size === 0) { return }

    // Generate current manifest
    const containerInfo = Array.from(this.containers.values())
      .reduce((acc, container) => {
        acc[container.id] = container.version
        return acc
      }, {})

    WaveboxHTTP.fetchContainerUpdates(this.clientId, containerInfo)
      .then((res) => {
        if (!res.containers || Object.keys(res.containers).length === 0) { return }

        // Filter any nulls or undefineds from the server
        const updatedContainers = {}
        Object.keys(res.containers).forEach((id) => {
          const data = res.containers[id]
          if (data !== undefined && data !== null) {
            const container = new Container(id, data)
            updatedContainers[id] = container
            this.containers.set(id, container)
          }
        })

        // Save and update
        containerPersistence.setJSONItems(updatedContainers)
        mailboxActions.containersUpdated.defer(updatedContainers)
        this.emitChange()
      })
  }

  handleStartAutoUpdateContainers () {
    actions.updateContainers.defer()

    if (this.containerAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.containerAutoUpdater = setInterval(() => {
      actions.updateContainers()
    }, WIRE_CONFIG_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoUpdateContainers () {
    clearInterval(this.containerAutoUpdater)
    this.containerAutoUpdater = null
  }

  handleAddContainer ({ id, data }) {
    const container = new Container(id, data)

    // Check if we already have this or a newer version
    if (this.containers.has(id)) {
      if (this.containers.get(id).version >= container.version) {
        this.preventDefault()
        return
      }
    }

    this.containers.set(id, container)
    containerPersistence.setJSONItem(id, data)
  }

  /* **************************************************************************/
  // Handlers: Account
  /* **************************************************************************/

  handleRemoteChangeAccount ({ account }) {
    const now = new Date().getTime()
    userPersistence.setJSONItem(USER_EPOCH, now)
    userPersistence.setJSONItem(USER, account)
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
