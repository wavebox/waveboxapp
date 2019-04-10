import { app } from 'electron'
import IEngineRuntime from './IEngineRuntime'
import IEngineStoreConnections from './IEngineStoreConnections'
import IEngineLoader from './IEngineLoader'
import WaveboxWindow from 'Windows/WaveboxWindow'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import { SUPPORTED_WBIE_SERVICE_TYPES } from 'shared/IEngine/IEngineTypes'

const privRuntimes = Symbol('privRuntimes')
const privStoreConnections = Symbol('privStoreConnections')

class IEngine {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privRuntimes] = new Map()
    this[privStoreConnections] = new IEngineStoreConnections()

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
  * @param serviceType: the type of the service
  */
  connectService (serviceId, serviceType) {
    Promise.resolve()
      .then(() => app.whenReady())
      .then(() => {
        if (this[privRuntimes].has(serviceId)) { return }
        if (!SUPPORTED_WBIE_SERVICE_TYPES.has(serviceType)) { return }

        const runtime = new IEngineRuntime(serviceId, serviceType, this[privStoreConnections])
        this[privRuntimes].set(serviceId, runtime)
      })
  }

  /**
  * Disconnects a service
  * @param serviceId: the id of the service
  */
  disconnectService (serviceId) {
    if (!this[privRuntimes].has(serviceId)) { return }
    this[privRuntimes].get(serviceId).destroy()
    this[privRuntimes].delete(serviceId)
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
      runtime.userRequestsSync()
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
}

export default new IEngine()
