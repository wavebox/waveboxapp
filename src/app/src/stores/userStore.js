import persistence from '../storage/userStorage'
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

    this.clientId = persistence.getJSONItem(CLIENT_ID)
    this.clientToken = persistence.getJSONItem(CLIENT_TOKEN)
    this.analyticsId = persistence.getJSONItem(ANALYTICS_ID)
    this.createdTime = persistence.getJSONItem(CREATED_TIME)
    this.extensions = persistence.getJSONItem(EXTENSIONS)
    this.wireConfig = persistence.getJSONItem(WIRE_CONFIG)
    this._user = {
      cached: null,
      dirty: true,
      placeholder: new User({}, new Date().getTime())
    }

    persistence.on(`changed:${CLIENT_ID}`, () => {
      this.clientId = persistence.getJSONItem(CLIENT_ID)
      this.emit('changed', { })
    })
    persistence.on(`changed:${CLIENT_TOKEN}`, () => {
      this.clientToken = persistence.getJSONItem(CLIENT_TOKEN)
      this.emit('changed', { })
    })
    persistence.on(`changed:${ANALYTICS_ID}`, () => {
      this.analyticsId = persistence.getJSONItem(ANALYTICS_ID)
      this.emit('changed', { })
    })
    persistence.on(`changed:${CREATED_TIME}`, () => {
      this.createdTime = persistence.getJSONItem(CREATED_TIME)
      this.emit('changed', { })
    })
    persistence.on(`changed:${USER}`, () => {
      this._user.dirty = true
      this.emit('changed', { })
    })
    persistence.on(`changed:${USER_EPOCH}`, () => {
      this._user.dirty = true
      this.emit('changed', { })
    })
    persistence.on(`changed:${EXTENSIONS}`, () => {
      const prev = this.extensions
      this.extensions = persistence.getJSONItem(EXTENSIONS)
      this.emit('changed', { })
      this.emit(`changed:${EXTENSIONS}`, { prev: prev, next: this.extensions })
    })
    persistence.on(`changed:${WIRE_CONFIG}`, () => {
      const prev = this.wireConfig
      this.wireConfig = persistence.getJSONItem(WIRE_CONFIG)
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
      this._user.cached = new User(persistence.getJSONItem(USER), persistence.getJSONItem(USER_EPOCH))
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
