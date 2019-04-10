import { webContents, app } from 'electron'
import { EventEmitter } from 'events'
import fetch from 'electron-fetch'
import { SessionManager } from 'SessionManager'
import pkg from 'package.json'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import IEngineServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/IEngineServiceDataReducer'
import WaveboxWindow from 'Windows/WaveboxWindow'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import { WB_IENGINE_MESSAGE_FOREGROUND_ } from 'shared/ipcEvents'
import xmldom from 'xmldom'
import { URL } from 'url'
import semver from 'semver'
import uuid from 'uuid'

const STORE_DATA_TYPES = Object.freeze({
  SERVICE: 'SERVICE',
  SERVICE_DATA: 'SERVICE_DATA',
  AUTH: 'AUTH'
})
const LIBS = Object.freeze({
  semver: semver,
  URL: URL,
  uuid: uuid,
  xmldom: xmldom
})

const privServiceId = Symbol('privServiceId')
const privStoreConnections = Symbol('privStoreConnections')

class IEngineApi extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param serviceId: the id of the service we're working on behalf of
  * @param storeConnections: the store connections to use
  */
  constructor (serviceId, storeConnections) {
    super()

    this[privServiceId] = serviceId
    this[privStoreConnections] = storeConnections
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get STORE_DATA_TYPES () { return STORE_DATA_TYPES }
  get appVersion () { return pkg.version }
  get serviceId () { return this[privServiceId] }
  get libs () { return LIBS }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  /**
  * @return true if the service is sleeping
  */
  isSleeping () {
    return this[privStoreConnections].accountStore.getState().isServiceSleeping(this[privServiceId])
  }

  /**
  * @return true if this is the active service
  */
  isActive () {
    return this[privStoreConnections].accountStore.getState().isServiceActive(this[privServiceId])
  }

  /* **************************************************************************/
  // Messaging
  /* **************************************************************************/

  /**
  * Sends a message to the foreground impl
  * @param ...args: an array of args to send
  */
  sendForegroundMessage (...args) {
    const payload = [
      `${WB_IENGINE_MESSAGE_FOREGROUND_}${this[privServiceId]}`,
      { sender: 'background' },
      JSON.stringify(args)
    ]

    WaveboxWindow.allTabMetaWithBacking(WINDOW_BACKING_TYPES.MAILBOX_SERVICE).forEach((meta, tabId) => {
      if (meta.serviceId === this[privServiceId]) {
        const wc = webContents.fromId(tabId)
        if (wc && !wc.isDestroyed()) {
          wc.send(...payload)
        }
      }
    })
  }

  /**
  * Sends a message to the foreground impl with a specific tabID
  * @param tabId: the id of the tab to send to
  * @param ...args: an array of args to send
  */
  sendForegroundMessageTo (tabId, ...args) {
    const meta = WaveboxWindow.tabMetaInfo(tabId)
    if (meta && meta.backing === WINDOW_BACKING_TYPES.MAILBOX_SERVICE && meta.serviceId === this[privServiceId]) {
      const wc = webContents.fromId(tabId)
      if (wc && !wc.isDestroyed()) {
        wc.send([
          `${WB_IENGINE_MESSAGE_FOREGROUND_}${this[privServiceId]}`,
          { sender: 'background' },
          JSON.stringify(args)
        ])
      }
    }
  }

  /* **************************************************************************/
  // HTTP
  /* **************************************************************************/

  /**
  * Runs a fetch for this account
  * @param url: the url to fetch
  * @param options: the options for the http request
  * @return promise
  */
  fetch (url, options) {
    const service = this[privStoreConnections].accountStore.getState().getService(this[privServiceId])
    if (!service) { return Promise.reject(new Error('Fetch cannot execute, service not available')) }

    const ses = SessionManager.fromPartition(service.partitionId)
    return Promise.resolve()
      .then(() => {
        return fetch(url, {
          ...options,
          headers: {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': app.getLocale(),
            'upgrade-insecure-requests': '1',
            'user-agent': ses.getUserAgent(),
            ...options.headers
          },
          useElectronNet: true,
          session: ses
        })
      })
  }

  /* **************************************************************************/
  // Store: Getters
  /* **************************************************************************/

  /**
  * Gets data from the store
  * @param types: an array of STORE_DATA_TYPES dictating what to fetch
  * @return an object, keys mapped to the types
  */
  getStoreData (types) {
    const accountState = this[privStoreConnections].accountStore.getState()

    return types.reduce((acc, type) => {
      switch (type) {
        case STORE_DATA_TYPES.SERVICE:
          acc[STORE_DATA_TYPES.SERVICE] = accountState.getService(this[privServiceId])
          break
        case STORE_DATA_TYPES.SERVICE_DATA:
          acc[STORE_DATA_TYPES.SERVICE_DATA] = accountState.getServiceData(this[privServiceId])
          break
        case STORE_DATA_TYPES.AUTH:
          acc[STORE_DATA_TYPES.AUTH] = accountState.getMailboxAuthForServiceId(this[privServiceId])
          break
      }
      return acc
    }, {})
  }

  /**
  * @return the current service
  */
  getService () {
    return this[privStoreConnections].accountStore.getState().getService(this[privServiceId])
  }

  /**
  * @return the current service data
  */
  getServiceData () {
    return this.getStoreData([STORE_DATA_TYPES.SERVICE_DATA])[STORE_DATA_TYPES.SERVICE_DATA]
  }

  /**
  * @return the current auth
  */
  getAuth () {
    return this.getStoreData([STORE_DATA_TYPES.AUTH])[STORE_DATA_TYPES.AUTH]
  }

  /* **************************************************************************/
  // Store: Modifiers
  /* **************************************************************************/

  /**
  * Updates the service data
  * @param changeset: the changeset to apply to the model
  */
  updateServiceDataWithChangeset (changeset) {
    this[privStoreConnections].accountActions.reduceServiceData(
      this[privServiceId],
      IEngineServiceDataReducer.setRawIEngineChangeset,
      changeset
    )
  }

  /**
  * Sets the display name on the service
  * @param name: the name to set
  */
  setServiceDisplayName (name) {
    this[privStoreConnections].accountActions.reduceService(
      this[privServiceId],
      ServiceReducer.setServiceDisplayName,
      name
    )
  }

  /**
  * Sets the avatar url
  * @param val: the value to set
  */
  setServiceAvatarUrl (val) {
    this[privStoreConnections].accountActions.reduceService(
      this[privServiceId],
      ServiceReducer.setServiceAvatarUrl,
      val
    )
  }

  /**
  * Marks the auth data invalid
  */
  setAuthInvalid () {
    const accountState = this[privStoreConnections].accountStore.getState()
    const auth = accountState.getMailboxAuthForServiceId(this[privServiceId])
    if (!auth) { return }
    this[privStoreConnections].accountActions.reduceAuth(auth.id, AuthReducer.makeInvalid)
  }

  /**
  * Marks the auth data valid
  */
  setAuthValid () {
    const accountState = this[privStoreConnections].accountStore.getState()
    const auth = accountState.getMailboxAuthForServiceId(this[privServiceId])
    if (!auth) { return }
    this[privStoreConnections].accountActions.reduceAuth(auth.id, AuthReducer.makeValid)
  }
}

export default IEngineApi
