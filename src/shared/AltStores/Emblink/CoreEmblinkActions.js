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
  * @param mailboxId=undefined: the id of the mailbox
  * @param serviceType=undefined: the type of service
  */
  composeNewMessage (...args) {
    return this.universalDispatch('composeNewMessage', args, (mailboxId, serviceType) => {
      return { mailboxId, serviceType }
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
  * @param mailboxId=undefined: if specified and valid will open the link in the given mailbox id
  * @param serviceType=undefined: if specified and valid will open the link in the given service type
  */
  composeNewMailtoLink (...args) {
    return this.universalDispatch('composeNewMailtoLink', args, (mailtoLink, mailboxId, serviceType) => {
      return { mailtoLink, mailboxId, serviceType }
    })
  }

  /* **************************************************************************/
  // Open
  /* **************************************************************************/

  /**
  * Opens an embedded item
  * @param mailboxId: the id of the mailbox to open
  * @param serviceType: the id of the servie to open
  * @param openPayload: the payload to open with
  */
  openItem (...args) {
    return this.universalDispatch('openItem', args, (mailboxId, serviceType, openPayload) => {
      return { mailboxId, serviceType, openPayload }
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
