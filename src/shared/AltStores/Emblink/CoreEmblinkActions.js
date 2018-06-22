import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltEmblinkIdentifiers'

class CoreEmblinkActions extends RemoteActions {
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
  // Compose
  /* **************************************************************************/

  /**
  * Asks the user where they would like to start composing a new message
  * @param serviceId=undefined: the id of the service
  */
  composeNewMessage (...args) {
    return this.universalDispatch('composeNewMessage', args, (serviceId) => {
      return { serviceId }
    })
  }

  /**
  * Clears the current compose
  */
  clearCompose (...args) {
    return this.universalDispatch('clearCompose', args, () => {
      return { }
    })
  }

  /**
  * Opens a mailto link
  * @param mailtoLink='': the link to try to open
  * @param serviceId=undefined: if specified and valid will open the link in the given service id
  */
  composeNewMailtoLink (...args) {
    return this.universalDispatch('composeNewMailtoLink', args, (mailtoLink, serviceId) => {
      return { mailtoLink, serviceId }
    })
  }

  /* **************************************************************************/
  // Open
  /* **************************************************************************/

  /**
  * Opens an embedded item
  * @param serviceId: the id of the service to open
  * @param openPayload: the payload to open with
  */
  openItem (...args) {
    return this.universalDispatch('openItem', args, (serviceId, openPayload) => {
      return { serviceId, openPayload }
    })
  }

  /**
  * Clears opening an item
  */
  clearOpenItem (...args) {
    return this.universalDispatch('clearOpenItem', args, () => {
      return {}
    })
  }
}

export default CoreEmblinkActions
