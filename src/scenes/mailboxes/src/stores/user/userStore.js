import RendererUserStore from 'shared/AltStores/User/RendererUserStore'
import { STORE_NAME } from 'shared/AltStores/User/AltUserIdentifiers'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import alt from '../alt'
import actions from './userActions'
import { WaveboxHTTP } from 'Server'
import { ipcRenderer } from 'electron'
import mailboxActions from '../mailbox/mailboxActions'
import semver from 'semver'
import pkg from 'package.json'
import {
  EXTENSION_AUTO_UPDATE_INTERVAL,
  WIRE_CONFIG_AUTO_UPDATE_INTERVAL
} from 'shared/constants'
import {
  WB_AUTH_WAVEBOX
} from 'shared/ipcEvents'

class UserStore extends RendererUserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this.extensionAutoUpdater = null
    this.wireConfigAutoUpdater = null
    this.containerAutoUpdater = null

    /* ****************************************/
    // Extensions
    /* ****************************************/

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

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Extensions
      handleUpdateExtensions: actions.UPDATE_EXTENSIONS,
      handleStartAutoUpdateExtensions: actions.START_AUTO_UPDATE_EXTENSIONS,
      handleStopAutoupdateExtensions: actions.STOP_AUTO_UPDATE_EXTENSIONS,

      // Wire Config
      handleUpdateWireConfig: actions.UPDATE_WIRE_CONFIG,
      handleStartAutoUpdateWireConfig: actions.START_AUTO_UPDATE_WIRE_CONFIG,
      handleStopAutoUpdateWireConfig: actions.STOP_AUTO_UPDATE_WIRE_CONFIG,

      // Containers
      handleSideloadContainerLocally: actions.SIDELOAD_CONTAINER_LOCALLY,
      handleUpdateContainers: actions.UPDATE_CONTAINERS,
      handleStartAutoUpdateContainers: actions.START_AUTO_UPDATE_CONTAINERS,
      handleStopAutoUpdateContainers: actions.STOP_AUTO_UPDATE_CONTAINERS,

      // Auth
      handleAuthenticateWithMailbox: actions.AUTHENTICATE_WITH_MAILBOX,
      handleAuthenticateWithGoogle: actions.AUTHENTICATE_WITH_GOOGLE,
      handleAuthenticateWithMicrosoft: actions.AUTHENTICATE_WITH_MICROSOFT,

      handleAuthenticationSuccess: actions.AUTHENTICATION_SUCCESS,
      handleAuthenticationFailure: actions.AUTHENTICATION_FAILURE
    })
  }

  /* **************************************************************************/
  // Handlers: Extensions
  /* **************************************************************************/

  handleUpdateExtensions () {
    this.preventDefault()

    WaveboxHTTP.fetchExtensionInfo(this.clientId)
      .then((res) => actions.setExtensions(res))
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
      .then((res) => actions.setWireConfig(res))
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
  // Containers
  /* **************************************************************************/

  handleSideloadContainerLocally ({ id, data }) {
    super.handleAddContainers({
      containers: { [id]: data }
    })
  }

  handleAddContainers (payload) {
    const updated = super.handleAddContainers(payload)
    if (Object.keys(updated).length) {
      mailboxActions.containersUpdated.defer(updated)
    }
    return updated
  }

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
        if (res.containers && Object.keys(res.containers).length) {
          actions.addContainers(res.containers)
        }
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

export default alt.createStore(UserStore, STORE_NAME)
