import { ipcRenderer } from 'electron'
import IEngineApi from './IEngineApi'
import IEngineModuleLoader from 'shared/IEngine/IEngineModuleLoader'
import {
  WB_IENGINE_RELOAD_FOREGROUND_,
  WB_IENGINE_MESSAGE_FOREGROUND_,
  WB_IENGINE_OPEN_ITEM_,
  WB_IENGINE_COMPOSE_ITEM_
} from 'shared/ipcEvents'

const privServiceId = Symbol('privServiceId')
const privIEngineAlias = Symbol('privIEngineAlias')
const privIEngineType = Symbol('privIEngineType')
const privApi = Symbol('privApi')
const privForeground = Symbol('privForeground')

class IEngineRuntime {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param manifest: the manifest that the engine can use to init
  */
  constructor (manifest) {
    this[privServiceId] = manifest.serviceId
    this[privIEngineAlias] = manifest.iengineAlias
    this[privIEngineType] = manifest.iengineType
    this[privApi] = new IEngineApi(this[privServiceId])
    this[privForeground] = undefined

    // Listen for events
    ipcRenderer.on(`${WB_IENGINE_RELOAD_FOREGROUND_}${this[privServiceId]}`, this._handleIpcReload)
    ipcRenderer.on(`${WB_IENGINE_MESSAGE_FOREGROUND_}${this[privServiceId]}`, this._handleIpcEngineMessage)
    ipcRenderer.on(`${WB_IENGINE_OPEN_ITEM_}${this[privServiceId]}`, this._handleIpcOpenItem)
    ipcRenderer.on(`${WB_IENGINE_COMPOSE_ITEM_}${this[privServiceId]}`, this._handleIpcComposeItem)

    // Connect the background impl
    if (manifest.js) {
      const ForegroundEngine = this._loadForegroundEngine(manifest)
      if (ForegroundEngine) {
        this[privForeground] = new ForegroundEngine(this[privApi], this[privServiceId])
      }
    }
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the background engine
  * @param manifest: the manifest to use
  * @return the class that can be instantiated
  */
  _loadForegroundEngine (manifest) {
    try {
      return IEngineModuleLoader.loadModule(manifest.js)
    } catch (ex) {
      console.warn(`Failed to load IEngine foreground.js for ${this[privIEngineAlias]} ${this[privIEngineType]}. Continuing with unknown side effects`, ex)
      return undefined
    }
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles the ipc channel indicating a live reload should happen
  * @param evt: the event that fired
  * @param reason: the reason for the load
  * @param manifest: the new manifest
  */
  _handleIpcReload = (evt, reason, manifest) => {
    if (this[privForeground]) {
      this[privForeground].destroy()
      this[privForeground] = undefined
    }

    if (manifest.js) {
      const ForegroundEngine = this._loadForegroundEngine(manifest)
      if (ForegroundEngine) {
        this[privForeground] = new ForegroundEngine(this[privApi], this[privServiceId])
      }
    }
  }

  /**
  * Handles an ipc message coming from a source
  * @param evt: the event that fired
  * @param info: the message info
  * @param args: the json args
  */
  _handleIpcEngineMessage = (evt, info, args) => {
    if (info.sender === 'background') {
      this[privApi].emit('background-message', { }, ...JSON.parse(args))
    }
  }

  /**
  * Handles a open command coming in
  * @param evt: the event that fired
  * @param payload: the payload to open
  */
  _handleIpcOpenItem = (evt, payload) => {
    this[privApi].emit('open-item', {}, payload || {})
  }

  /**
  * Handles a compose command coming in
  * @param evt: the event that fired
  * @param payload: the payload to compose with
  */
  _handleIpcComposeItem = (evt, payload) => {
    this[privApi].emit('compose-item', {}, payload || {})
  }
}

export default IEngineRuntime
