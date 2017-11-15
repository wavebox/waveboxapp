import persistence from '../storage/userStorage'
import { EventEmitter } from 'events'
import {
  CLIENT_ID,
  ANALYTICS_ID,
  CREATED_TIME,
  CLIENT_TOKEN,
  USER,
  USER_EPOCH,
  EXTENSIONS
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
    this._user = {
      cached: null,
      dirty: true,
      placeholder: new User({}, new Date().getTime())
    }

    persistence.on(`changed:${CLIENT_ID}`, () => {
      this.clientId = persistence.getJSONItem(CLIENT_ID)
    })
    persistence.on(`changed:${CLIENT_TOKEN}`, () => {
      this.clientToken = persistence.getJSONItem(CLIENT_TOKEN)
    })
    persistence.on(`changed:${ANALYTICS_ID}`, () => {
      this.analyticsId = persistence.getJSONItem(ANALYTICS_ID)
    })
    persistence.on(`changed:${CREATED_TIME}`, () => {
      this.createdTime = persistence.getJSONItem(CREATED_TIME)
    })
    persistence.on(`changed:${USER}`, () => {
      this._user.dirty = true
    })
    persistence.on(`changed:${USER_EPOCH}`, () => {
      this._user.dirty = true
    })
    persistence.on(`changed:${EXTENSIONS}`, () => {
      this.extensions = persistence.getJSONItem(EXTENSIONS)
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
}

export default new UserStore()
