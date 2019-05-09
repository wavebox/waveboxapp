import { app, ipcMain, webContents, session } from 'electron'
import IEngineRuntime from './IEngineRuntime'
import IEngineStoreConnections from './IEngineStoreConnections'
import IEngineLoader from './IEngineLoader'
import IEngineAuthRuntime from './IEngineAuthRuntime'
import WaveboxWindow from 'Windows/WaveboxWindow'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import { WB_IENGINE_AUTH_SERVICE } from 'shared/ipcEvents'
import {
  IENGINE_ALIASES,
  IENGINE_ALIAS_TO_TYPE
} from 'shared/IEngine/IEngineTypes'
import IENGINE_AUTH_MODES from 'shared/IEngine/IEngineAuthModes'

const privRuntimes = Symbol('privRuntimes')
const privStoreConnections = Symbol('privStoreConnections')
const privAuthRuntime = Symbol('privAuthRuntime')

class IEngine {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privRuntimes] = new Map()
    this[privStoreConnections] = new IEngineStoreConnections()
    this[privAuthRuntime] = new IEngineAuthRuntime()

    ipcMain.on(WB_IENGINE_AUTH_SERVICE, this.handleIPCAuthService)

    setTimeout(() => {
      IEngineLoader.pollForUpdates()
    }, 20000)
  }

  /* **************************************************************************/
  // Connectors
  /* **************************************************************************/

  /**
  * Connects the account store to the api
  * @param accountStore: the account store
  * @param accountActions: the account actions
  */
  connectAccountStore (...args) {
    this[privStoreConnections].connectAccount(...args)
  }

  /* **************************************************************************/
  // Service interface
  /* **************************************************************************/

  /**
  * Connects a service
  * @param serviceId: the id of the service
  * @param iengineAlias: the alias of the engine
  */
  connectService (serviceId, iengineAlias) {
    Promise.resolve()
      .then(() => app.whenReady())
      .then(() => {
        if (this[privRuntimes].has(serviceId)) { return }
        if (!IENGINE_ALIASES.has(iengineAlias)) { return }

        const runtime = new IEngineRuntime(serviceId, iengineAlias, this[privStoreConnections])
        this[privRuntimes].set(serviceId, runtime)
      })
      .catch((ex) => {
        console.error(`Uncaught exception when creating WBIE for service ${serviceId}`, ex)
      })
  }

  /**
  * Disconnects a service
  * @param serviceId: the id of the service
  */
  disconnectService (serviceId) {
    if (!this[privRuntimes].has(serviceId)) { return }
    try {
      this[privRuntimes].get(serviceId).destroy()
      this[privRuntimes].delete(serviceId)
    } catch (ex) {
      console.error(`Uncaught exception when destroying WBIE for service ${serviceId}`, ex)
    }
  }

  /* **************************************************************************/
  // Foreground
  /* **************************************************************************/

  /**
  * Gets the foreground configuration for a tab
  * @param tabId: the id of the tab
  * @return the foreground configuration or undefined if there is nothing to do
  */
  getForegroundConfiguration (tabId) {
    const meta = WaveboxWindow.tabMetaInfo(tabId)
    if (meta && meta.backing === WINDOW_BACKING_TYPES.MAILBOX_SERVICE) {
      const runtime = this[privRuntimes].get(meta.serviceId)
      if (runtime) {
        return runtime.getForegroundConfiguration(tabId)
      }
    }
    return undefined
  }

  /* **************************************************************************/
  // User events
  /* **************************************************************************/

  /**
  * Handles the user requesting a sync
  * @param serviceId: the id of the service to sync
  */
  userRequestsSync (serviceId) {
    const runtime = this[privRuntimes].get(serviceId)
    if (runtime) {
      try {
        runtime.userRequestsSync()
      } catch (ex) {
        console.error(`Uncaught exception when requesting user sync in WBIE for service ${serviceId}`, ex)
      }
    }
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Manually checks for updates
  */
  checkForUpdates () {
    IEngineLoader.fetchUpdateAndUnpack().catch((ex) => {
      console.warn(`Failed to fetch and unpack IEngine updates`, ex)
    })
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Auths a service
  * @param evt: the event that fired
  * @param returnIpcChannel: the ipc channel to return the response on
  * @param iengineAlias: the alias of the iengine to auth
  * @param authConfig: an auth configuration object consisting of
  *     @param partitionId: the partition to auth with
  *     @param mode: the authentication mode to use
  *     @param context: context to return to the sender
  */
  handleIPCAuthService = (evt, returnIpcChannel, iengineAlias, authConfig) => {
    // Grab some context and build some helper functions
    const senderId = evt.sender.id
    const returnSuccess = (auth) => {
      const wc = webContents.fromId(senderId)
      if (!wc && wc.isDestroyed()) { return }
      wc.send(returnIpcChannel, undefined, {
        context: authConfig.context,
        auth: auth
      })
    }
    const returnError = (ex) => {
      const wc = webContents.fromId(senderId)
      if (!wc && wc.isDestroyed()) { return }
      wc.send(returnIpcChannel, {
        context: authConfig.context,
        error: ex && ex.toString
          ? ex.toString()
          : 'Unknown Error'
      }, undefined)
    }

    // Check we're supported
    if (!IENGINE_ALIASES.has(iengineAlias)) {
      return returnError(`Unsupported iengineAlias "${iengineAlias}"`)
    }

    // Load the iEngine resources
    const engineType = IENGINE_ALIAS_TO_TYPE[iengineAlias]
    let adaptor
    try {
      adaptor = IEngineLoader.loadJSONResourceSync(engineType, 'auth-adaptor.json')
    } catch (ex) {
      return returnError(`Failed to load adaptor for iengine "${iengineAlias}"`)
    }

    // Run the tasks
    Promise.resolve()
      .then(() => {
        if (authConfig.authMode === IENGINE_AUTH_MODES.REAUTHENTICATE) {
          if (this[privAuthRuntime].adaptorClearsCookiesOnReauthenticate(adaptor)) {
            const ses = session.fromPartition(authConfig.partitionId)
            return Promise.resolve()
              .then(() => { return new Promise((resolve) => { ses.clearStorageData(resolve) }) })
              .then(() => { return new Promise((resolve) => { ses.clearCache(resolve) }) })
              .catch((ex) => Promise.resolve()) // gobble
          }
        }
        return Promise.resolve()
      })
      .then(() => {
        if (this[privAuthRuntime].adaptorUsesAuthWindow(adaptor)) {
          return this[privAuthRuntime].startAuthWindow(engineType, authConfig.partitionId, authConfig.authMode)
        } else {
          return Promise.resolve()
        }
      })
      .then(
        (res) => returnSuccess(res),
        (ex) => returnError(ex)
      )
  }
}

export default new IEngine()
