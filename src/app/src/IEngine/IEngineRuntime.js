import { ipcMain, webContents } from 'electron'
import IEngineApi from './IEngineApi'
import {
  WB_IENGINE_MESSAGE_BACKGROUND_,
  WB_IENGINE_RELOAD_FOREGROUND_
} from 'shared/ipcEvents'
import {
  IENGINE_ALIAS_TO_TYPE
} from 'shared/IEngine/IEngineTypes'
import deepEqual from 'fast-deep-equal'
import IEngineLoader from './IEngineLoader'

const privServiceId = Symbol('privServiceId')
const privStoreConnections = Symbol('privStoreConnections')
const privState = Symbol('privState')
const privApi = Symbol('privApi')
const privBackground = Symbol('privBackground')
const privIEngineAlias = Symbol('privIEngineAlias')
const privIEngineType = Symbol('privIEngineType')

class IEngineRuntime {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param serviceId: the id of the service we're working on behalf of
  * @param iengineAlias: the type of service that can be used to load the engine
  * @param storeConnections: the store connections to use
  */
  constructor (serviceId, iengineAlias, storeConnections) {
    this[privServiceId] = serviceId
    this[privIEngineAlias] = iengineAlias
    this[privIEngineType] = IENGINE_ALIAS_TO_TYPE[iengineAlias]
    this[privStoreConnections] = storeConnections
    this[privApi] = new IEngineApi(serviceId, storeConnections)
    this[privBackground] = undefined

    // Build the initial state
    const accountState = this[privStoreConnections].accountStore.getState()
    const service = accountState.getService(serviceId)
    this[privState] = {
      isActive: accountState.isServiceActive(serviceId),
      isSleeping: accountState.isServiceSleeping(serviceId),
      watchFields: (service ? service.syncWatchFields : []).reduce((acc, k) => {
        acc[k] = service[k]
        return acc
      }, {})
    }

    // Bind onto the stores
    this[privStoreConnections].accountStore.listen(this._handleAccoutStoreChanged)

    // Listen to app events
    ipcMain.on(`${WB_IENGINE_MESSAGE_BACKGROUND_}${this[privServiceId]}`, this._handleIpcEngineMessage)
    IEngineLoader.on('reload-engines', this._handleEngineReloadEvent)

    // Connect the background impl
    const BackgroundEngine = this._loadBackgroundEngine()
    if (BackgroundEngine) {
      this[privBackground] = new BackgroundEngine(this[privApi], this[privServiceId])
    }
  }

  /**
  * Tears down this instance
  */
  destroy () {
    // Unbind our stores
    this[privStoreConnections].accountStore.unlisten(this._handleAccoutStoreChanged)

    // Unlisten to app events
    ipcMain.removeListener(`${WB_IENGINE_MESSAGE_BACKGROUND_}${this[privServiceId]}`, this._handleIpcEngineMessage)
    IEngineLoader.removeListener('reload-engines', this._handleEngineReloadEvent)

    // Disconnect background
    if (this[privBackground]) {
      this[privBackground].destroy()
    }
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the background engine
  * @return the class that can be instantiated or undefined on error
  */
  _loadBackgroundEngine () {
    try {
      return IEngineLoader.loadModuleSync(this[privIEngineType], 'background.js')
    } catch (ex) {
      console.warn(`Failed to load IEngine background.js for ${this[privIEngineAlias]} ${this[privIEngineType]}. Continuing with unknown side effects`, ex)
      return undefined
    }
  }

  /**
  * Loads the manifest for the foreground engine
  * @return the manifest that can be passed to a renderer
  */
  _loadForegroundEngineManifest () {
    try {
      const foreground = IEngineLoader.loadStringResourceSync(this[privIEngineType], 'foreground.js')
      const adaptor = IEngineLoader.loadJSONResourceSync(this[privIEngineType], 'foreground-adaptor.json')
      return {
        matches: adaptor.matches,
        js: foreground,
        serviceId: this[privServiceId],
        iengineAlias: this[privIEngineAlias],
        iengineType: this[privIEngineType]
      }
    } catch (ex) {
      console.warn(`Failed to load IEngine foreground manifest for ${this[privIEngineAlias]} ${this[privIEngineType]}. Continuing with unknown side effects`, ex)
      return undefined
    }
  }

  /* **************************************************************************/
  // Store event handlers
  /* **************************************************************************/

  _handleAccoutStoreChanged = (accountState) => {
    // Update active
    const nextIsActive = accountState.isServiceActive(this[privServiceId])
    if (nextIsActive !== this[privState].isActive) {
      this[privState].isActive = nextIsActive
      if (nextIsActive) {
        this[privApi].emit('service-active', { sender: this[privApi] })
      } else {
        this[privApi].emit('service-inactive', { sender: this[privApi] })
      }
    }

    // Update the sleep state
    const nextIsSleeping = accountState.isServiceSleeping(this[privServiceId])
    if (nextIsSleeping !== this[privState].isSleeping) {
      this[privState].isSleeping = nextIsSleeping
      if (nextIsSleeping) {
        this[privApi].emit('service-sleep', { sender: this[privApi] })
      } else {
        this[privApi].emit('service-awaken', { sender: this[privApi] })
      }
    }

    // Update the watch field
    const service = accountState.getService(this[privServiceId])
    const nextWatchFields = (service ? service.syncWatchFields : []).reduce((acc, k) => {
      acc[k] = service[k]
      return acc
    }, {})

    if (!deepEqual(this[privState].watchFields, nextWatchFields)) {
      const prevWatchFields = this[privState].watchFields
      this[privState].watchFields = nextWatchFields
      this[privApi].emit('service-watch-fields-changed', { sender: this[privApi] }, prevWatchFields, nextWatchFields)
    }
  }

  /* **************************************************************************/
  // System events
  /* **************************************************************************/

  /**
  * Handles the updater indicating that engines need to reload
  * @param evt: the event that fired
  * @param reason: the reason for the reload
  * @param iengineTypes: array of iengineTypes that need reloading
  */
  _handleEngineReloadEvent = (evt, reason, iengineTypes) => {
    if (iengineTypes.includes(this[privIEngineType])) {
      if (this[privBackground]) {
        this[privBackground].destroy()
        this[privBackground] = undefined
      }

      const BackgroundEngine = this._loadBackgroundEngine()
      if (BackgroundEngine) {
        this[privBackground] = new BackgroundEngine(this[privApi], this[privServiceId])
      }

      webContents.getAllWebContents().forEach((wc) => {
        wc.send(`${WB_IENGINE_RELOAD_FOREGROUND_}${this[privServiceId]}`, reason, this._loadForegroundEngineManifest())
      })
    }
  }

  /* **************************************************************************/
  // IPC messages
  /* **************************************************************************/

  /**
  * Handles an ipc message coming from a source
  * @param evt: the event that fired
  * @param info: the message info
  * @param args: the json args
  */
  _handleIpcEngineMessage = (evt, info, args) => {
    if (info.sender === 'foreground') {
      this[privApi].emit('foreground-message', { sender: evt.sender.id }, ...JSON.parse(args))
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
    return this._loadForegroundEngineManifest()
  }

  /* **************************************************************************/
  // User events
  /* **************************************************************************/

  /**
  * Handles the user requesting a sync
  */
  userRequestsSync () {
    this[privApi].emit('user-requests-sync', { sender: this[privApi] })
  }
}

export default IEngineRuntime
