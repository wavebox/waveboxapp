import { ipcMain } from 'electron'
import alt from '../alt'
import CoreUserStore from 'shared/AltStores/User/CoreUserStore'
import { STORE_NAME } from 'shared/AltStores/User/AltUserIdentifiers'
import PersistenceBootstrapper from './PersistenceBootstrapper'
import actions from './userActions'  // eslint-disable-line
import semver from 'semver'
import userPersistence from 'Storage/userStorage'
import wirePersistence from 'Storage/wireStorage'
import extensionStorePersistence from 'Storage/extensionStoreStorage'
import containerPersistence from 'Storage/containerStorage'
import { SAPIExtensionLoader } from 'Extensions/ServiceApi'
import { evtMain } from 'AppEvents'
import { ACContainerSAPI } from 'shared/Models/ACContainer'
import {
  CLIENT_TOKEN,
  USER,
  USER_EPOCH,
  EXTENSIONS,
  WIRE_CONFIG
} from 'shared/Models/DeviceKeys'
import {
  WB_USER_SET_CLIENT_TOKEN,
  WB_USER_SET_USER
} from 'shared/ipcEvents'

class UserStore extends CoreUserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Extensions
    /* ****************************************/

    /**
    * @return the launch settings
    */
    this.launchSettingsJS = () => {
      return {
        clientId: this.clientId,
        ...(this.user ? {
          analyticsEnabled: this.user.analyticsEnabled
        } : {
          analyticsEnabled: false
        })
      }
    }

    /* ****************************************/
    // Remote
    /* ****************************************/

    ipcMain.on(WB_USER_SET_CLIENT_TOKEN, this.handleIPCSetClientToken)
    ipcMain.on(WB_USER_SET_USER, this.handleIPCSetUser)

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      handleReloadContainerSAPI: actions.RELOAD_CONTAINER_SAPI
    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    // This is a bit lazy because it involves going back to the stores for the data
    // but it should be cached so there shouldn't be a performance toll. We're doing
    // this because we sub-optimally stored the user data and have to load from multiple
    // storage buckets for this store. Doing it this way just reduces code dupe
    return {
      ...PersistenceBootstrapper.loadBaseStoreData(),
      containerSAPI: Array.from(this.containerSAPI.keys()).reduce((acc, k) => {
        acc[k] = this.containerSAPI.get(k).cloneData()
        return acc
      }, {})
    }
  }

  /* **************************************************************************/
  // IPC
  /* **************************************************************************/

  /**
  * Handles the client token being set over IPC
  * @param evt: the ipc event that fired
  * @param clientToken: the new client token
  */
  handleIPCSetClientToken = (evt, clientToken) => {
    try {
      this.clientToken = clientToken
      userPersistence.setJSONItem(CLIENT_TOKEN, clientToken)
      this.dispatchToRemote('remoteSetClientToken', [clientToken])
      this.emitChange()
      evt.returnValue = {}
    } catch (ex) {
      console.error(`Failed to respond to "${WB_USER_SET_CLIENT_TOKEN}" continuing with unknown side effects`, ex)
      evt.returnValue = {}
    }
  }

  /**
  * Handles the user being set over ipc
  * @param evt: the ipc event that fired
  * @param userJS: the json for the user
  * @param userEpoch: the epoch time for the user
  */
  handleIPCSetUser = (evt, userJS, userEpoch) => {
    try {
      this.handleSetUser({ userJS, userEpoch })
      this.emitChange()
      evt.returnValue = {}
    } catch (ex) {
      console.error(`Failed to respond to "${WB_USER_SET_USER}" continuing with unknown side effects`, ex)
      evt.returnValue = {}
    }
  }

  /* **************************************************************************/
  // User
  /* **************************************************************************/

  handleSetUser (payload) {
    super.handleSetUser(payload)
    const { userJS, userEpoch } = payload
    userPersistence.setJSONItem(USER, userJS)
    userPersistence.setJSONItem(USER_EPOCH, userEpoch)
    this.dispatchToUniversalRemote('setUser', [userJS, userEpoch])
  }

  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  handleSetExtensions (payload) {
    const { extensions } = payload
    extensionStorePersistence.setJSONItem(EXTENSIONS, extensions)
    super.handleSetExtensions(payload)
    this.dispatchToUniversalRemote('setExtensions', [extensions])

    // Not exactly great but picks up from the setExtensions call
    // @Thomas101 look to refactor at a later date
    evtMain.emit(evtMain.WB_UPDATE_INSTALLED_EXTENSIONS, {})
  }

  /* **************************************************************************/
  // Wire config
  /* **************************************************************************/

  handleSetWireConfig (payload) {
    const { config } = payload
    if (!semver.gt(config.version, this.wireConfigVersion())) {
      this.preventDefault()
      return
    }

    wirePersistence.setJSONItem(WIRE_CONFIG, config)
    super.handleSetWireConfig(payload)
    this.dispatchToUniversalRemote('setWireConfig', [config])
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  handleAddContainers (payload) {
    const updated = super.handleAddContainers(payload)
    if (Object.keys(updated).length) {
      const vanillaUpdated = Object.keys(updated).reduce((acc, id) => {
        acc[id] = updated[id].cloneData()
        return acc
      }, {})
      containerPersistence.setJSONItems(vanillaUpdated)
      this.dispatchToUniversalRemote('addContainers', vanillaUpdated)
    }

    return updated
  }

  handleReloadContainerSAPI () {
    const containerSAPI = SAPIExtensionLoader.loadContainersSync()
    this.containerSAPI = Object.keys(containerSAPI || {}).reduce((acc, id) => {
      acc.set(id, new ACContainerSAPI(containerSAPI[id]))
      return acc
    }, new Map())
    this.dispatchToRemote('remoteSetContainerSAPI', [containerSAPI])
  }
}

export default alt.createStore(UserStore, STORE_NAME)
