import userPersistence from '../storage/userStorage'
import extensionStorePersistence from '../storage/extensionStoreStorage'
import wirePersistence from '../storage/wireStorage'
import { EventEmitter } from 'events'
import {
  CLIENT_ID,
  ANALYTICS_ID,
  CREATED_TIME,
  CLIENT_TOKEN,
  USER,
  USER_EPOCH,
  EXTENSIONS,
  WIRE_CONFIG
} from 'shared/Models/DeviceKeys'
import User from 'shared/Models/User'

class UserStore extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this.clientId = userPersistence.getJSONItem(CLIENT_ID)
    this.clientToken = userPersistence.getJSONItem(CLIENT_TOKEN)
    this.analyticsId = userPersistence.getJSONItem(ANALYTICS_ID)
    this.createdTime = userPersistence.getJSONItem(CREATED_TIME)
    this.extensions = extensionStorePersistence.getJSONItem(EXTENSIONS)
    this.wireConfig = wirePersistence.getJSONItem(WIRE_CONFIG)
    this._user = {
      cached: null,
      dirty: true,
      placeholder: new User({}, new Date().getTime())
    }

    userPersistence.on(`changed:${CLIENT_ID}`, () => {
      this.clientId = userPersistence.getJSONItem(CLIENT_ID)
      this.emit('changed', { })
    })
    userPersistence.on(`changed:${CLIENT_TOKEN}`, () => {
      this.clientToken = userPersistence.getJSONItem(CLIENT_TOKEN)
      this.emit('changed', { })
    })
    userPersistence.on(`changed:${ANALYTICS_ID}`, () => {
      this.analyticsId = userPersistence.getJSONItem(ANALYTICS_ID)
      this.emit('changed', { })
    })
    userPersistence.on(`changed:${CREATED_TIME}`, () => {
      this.createdTime = userPersistence.getJSONItem(CREATED_TIME)
      this.emit('changed', { })
    })
    userPersistence.on(`changed:${USER}`, () => {
      this._user.dirty = true
      this.emit('changed', { })
    })
    userPersistence.on(`changed:${USER_EPOCH}`, () => {
      this._user.dirty = true
      this.emit('changed', { })
    })
    extensionStorePersistence.on(`changed:${EXTENSIONS}`, () => {
      const prev = this.extensions
      this.extensions = extensionStorePersistence.getJSONItem(EXTENSIONS)
      this.emit('changed', { })
      this.emit(`changed:${EXTENSIONS}`, { prev: prev, next: this.extensions })
    })
    wirePersistence.on(`changed:${WIRE_CONFIG}`, () => {
      const prev = this.wireConfig
      this.wireConfig = wirePersistence.getJSONItem(WIRE_CONFIG)
      this.emit('changed', { })
      this.emit(`changed:${WIRE_CONFIG}`, { prev: prev, next: this.wireConfig })
    })
  }

  checkAwake () { return true }

  /* ****************************************************************************/
  // Properties: User
  /* ****************************************************************************/

  get user () {
    if (this._user.dirty) {
      this._user.cached = new User(userPersistence.getJSONItem(USER), userPersistence.getJSONItem(USER_EPOCH))
      this._user.dirty = false
    }
    return this._user.cached
  }
  get hasUser () { return !!this.user }
  get userOrDefault () { return this.hasUser ? this.user : this._user.placeholder }

  /* ****************************************************************************/
  // Properties: Extensions
  /* ****************************************************************************/

  /**
  * Generates a set of disabled extension ids
  * @return a set of known disabled extension ids
  */
  generateDisabledExtensionIds () {
    const ids = (this.extensions || [])
      .filter((ext) => !this.userOrDefault.hasExtensionWithLevel(ext.availableTo))
      .map((ext) => ext.id)
    return new Set(ids)
  }

  /**
  * @return the extensions in a map indexed by id
  */
  indexedExtensions () {
    return this.extensions.reduce((acc, info) => {
      acc.set(info.id, info)
      return acc
    }, new Map())
  }

  /* ****************************************************************************/
  // Properties: Wire config
  /* ****************************************************************************/
}

export default new UserStore()
