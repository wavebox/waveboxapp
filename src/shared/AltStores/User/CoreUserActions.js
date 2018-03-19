import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltUserIdentifiers'

class CoreUserActions extends RemoteActions {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get displayName () { return ACTIONS_NAME }

  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () {
    throw new Error('Action not implemented "load"')
  }

  /* **************************************************************************/
  // User
  /* **************************************************************************/

  /**
  * Sets a user object
  * @param userJS: the json for the user
  * @param userEpoch=now: the time the user was received
  */
  setUser (...args) {
    return this.universalDispatch('setUser', args, (userJS, userEpoch) => {
      return {
        userJS: userJS,
        userEpoch: userEpoch || new Date().getTime()
      }
    })
  }

  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  /**
  * Sets the full set of extensions
  * @param extensions: the extensions to set
  */
  setExtensions (...args) {
    return this.universalDispatch('setExtensions', args, (extensions) => {
      return { extensions }
    })
  }

  /* **************************************************************************/
  // Wire Config
  /* **************************************************************************/

  /**
  * Sets the wire config
  * @param config: the wire config
  */
  setWireConfig (...args) {
    return this.universalDispatch('setWireConfig', args, (config) => {
      return { config }
    })
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  /**
  * Adds new containers
  * @param containers: an object of id to data
  */
  addContainers (...args) {
    return this.universalDispatch('addContainers', args, (containers) => {
      return { containers }
    })
  }
}

export default CoreUserActions
