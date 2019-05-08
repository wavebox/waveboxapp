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
import IEngineApiLibs from './IEngineApiLibs'

const STORE_DATA_TYPES = Object.freeze({
  SERVICE: 'SERVICE',
  SERVICE_DATA: 'SERVICE_DATA',
  AUTH: 'AUTH'
})

const privServiceId = Symbol('privServiceId')
const privStoreConnections = Symbol('privStoreConnections')
const privDestroyed = Symbol('privDestroyed')

class IEngineBackgroundApi extends EventEmitter {
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
    this[privDestroyed] = false
  }

  /**
  * Destroys the api
  */
  destroy () {
    if (this[privDestroyed]) { return }
    this[privDestroyed] = true
  }

  /**
  * @return true if the api is destroy
  */
  isDestroyed () { return this[privDestroyed] }

  /**
  * Throws an error if the api has been destroyed
  */
  throwOnDestroyed () {
    if (this[privDestroyed]) {
      throw new Error('IEngineBackgroundApi has been destroyed')
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get STORE_DATA_TYPES () { return STORE_DATA_TYPES }
  get appVersion () { return pkg.version }
  get platform () { return process.platform }
  get serviceId () { return this[privServiceId] }
  get libs () { return IEngineApiLibs }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  /**
  * @return true if the service is sleeping
  */
  isSleeping () {
    this.throwOnDestroyed()
    return this[privStoreConnections].accountStore.getState().isServiceSleeping(this[privServiceId])
  }

  /**
  * @return true if this is the active service
  */
  isActive () {
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
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
      .then(
        (res) => {
          this.emit('-network-log', {}, [
            `${new Date().toLocaleString()}`,
            `[${this[privServiceId]}:${service.displayName}]`,
            `${options.method || 'GET'}`,
            url,
            `OK`,
            `${res.ok}`,
            `${res.status}:${res.statusText}`
          ].join(' '))
          return Promise.resolve(res)
        },
        (err) => {
          this.emit('-network-log', {}, [
            `${new Date().toLocaleString()}`,
            `[${this[privServiceId]}:${service.displayName}]`,
            `${options.method || 'GET'}`,
            url,
            `FAILED`,
            `${err}`
          ].join(' '))
          return Promise.reject(err)
        }
      )
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
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
    return this[privStoreConnections].accountStore.getState().getService(this[privServiceId])
  }

  /**
  * @return the current service data
  */
  getServiceData () {
    this.throwOnDestroyed()
    return this.getStoreData([STORE_DATA_TYPES.SERVICE_DATA])[STORE_DATA_TYPES.SERVICE_DATA]
  }

  /**
  * @return the current auth
  */
  getAuth () {
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
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
    this.throwOnDestroyed()
    this[privStoreConnections].accountActions.reduceService(
      this[privServiceId],
      ServiceReducer.setServiceAvatarUrl,
      val
    )
  }

  /**
  * Sets the avatar characted display on the service
  * @param val: the value to set
  */
  setServiceAvatarCharacterDisplay (val) {
    this.throwOnDestroyed()
    this[privStoreConnections].accountActions.reduceService(
      this[privServiceId],
      ServiceReducer.setServiceAvatarCharacterDisplay,
      val
    )
  }

  /**
  * Sets all the service display properties in one store dispatch
  * @param displayName: the new display name
  * @param avatarURL: the new avatar url
  * @param avatarCharacterDisplay: the new avatar character display
  */
  setServiceAllDisplay (displayName, avatarURL, avatarCharacterDisplay) {
    this.throwOnDestroyed()
    this[privStoreConnections].accountActions.reduceService(
      this[privServiceId],
      ServiceReducer.setAllServiceDisplay,
      displayName,
      avatarURL,
      avatarCharacterDisplay
    )
  }

  /**
  * Marks the auth data invalid
  */
  setAuthInvalid () {
    this.throwOnDestroyed()
    const accountState = this[privStoreConnections].accountStore.getState()
    const auth = accountState.getMailboxAuthForServiceId(this[privServiceId])
    if (!auth) { return }
    this[privStoreConnections].accountActions.reduceAuth(auth.id, AuthReducer.makeInvalid)
  }

  /**
  * Marks the auth data valid
  */
  setAuthValid () {
    this.throwOnDestroyed()
    const accountState = this[privStoreConnections].accountStore.getState()
    const auth = accountState.getMailboxAuthForServiceId(this[privServiceId])
    if (!auth) { return }
    this[privStoreConnections].accountActions.reduceAuth(auth.id, AuthReducer.makeValid)
  }

  /**
  * Sets a user id in the auth data
  * @param userId: the id of the user
  */
  setAuthUserId (userId) {
    this.throwOnDestroyed()
    const accountState = this[privStoreConnections].accountStore.getState()
    const auth = accountState.getMailboxAuthForServiceId(this[privServiceId])
    if (!auth) { return }
    if (auth.userId === userId) { return }
    this[privStoreConnections].accountActions.reduceAuth(auth.id, AuthReducer.setUserId, userId)
  }
}

export default IEngineBackgroundApi
