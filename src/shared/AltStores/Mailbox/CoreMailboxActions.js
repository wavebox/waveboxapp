import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltMailboxIdentifiers'
import {
  stringifyReducer,
  parseReducer
} from './MailboxReducers'
import CoreMailbox from '../../Models/Accounts/CoreMailbox'

class CoreMailboxActions extends RemoteActions {
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
  // Mailboxes
  /* **************************************************************************/

  /**
  * Creates a new mailbox
  * @param id: the id of the mailbox
  * @param data: the data to create it with
  */
  create (...args) {
    if (process.type === 'browser') {
      const [id, data] = args
      return { id, data }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('create', args)
    }
  }

  /**
  * Removes a mailbox
  * @param id: the id of the mailbox to update
  */
  remove (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('remove', args)
    }
  }

  /**
  * Changes the index of a mailbox
  * @param id: the id of the mailbox to move
  * @param nextIndex: the next index to place the mailbox
  */
  changeIndex (...args) {
    if (process.type === 'renderer') {
      this.remoteDispatch('changeIndex', args)
    }

    const [id, nextIndex] = args
    return { id, nextIndex }
  }

  /**
  * Updates and modifies a mailbox
  * @param id: the id of the mailbox to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduce (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Mailbox Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Mailbox Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduce', [id, reducerName].concat(reducerArgs))
    }
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  /**
  * Indicates the ids of the given containers have been updated
  * @param containerIds: a list of container ids that have been udpated
  */
  containersUpdated (...args) {
    if (process.type === 'browser') {
      const [containerIds] = args
      return { containerIds }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('containersUpdated', args)
    }
  }

  /* **************************************************************************/
  // Avatar
  /* **************************************************************************/

  /**
  * Sets a custom avatar
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setCustomAvatar (...args) {
    if (process.type === 'browser') {
      const [id, b64Image] = args
      return { id, b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setCustomAvatar', args)
    }
  }

  /**
  * Sets a service avatar locally for services that don't support grabbing it off the web
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setServiceLocalAvatar (...args) {
    if (process.type === 'browser') {
      const [id, b64Image] = args
      return { id, b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setServiceLocalAvatar', args)
    }
  }

  /* **************************************************************************/
  // Services
  /* **************************************************************************/

  /**
  * Updates and modifies a mailbox service
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceService (...args) {
    const [id, serviceType, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Mailbox Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, serviceType: serviceType, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Mailbox Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceService', [id, serviceType, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a mailbox service only if it's active
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfActive (...args) {
    const [id, serviceType, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Mailbox Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, serviceType: serviceType, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Mailbox Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceIfActive', [id, serviceType, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a mailbox service only if it's inactive
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfInactive (...args) {
    const [id, serviceType, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Mailbox Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, serviceType: serviceType, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Mailbox Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceIfInactive', [id, serviceType, reducerName].concat(reducerArgs))
    }
  }

  /* **************************************************************************/
  // Sleeping
  /* **************************************************************************/

  /**
  * Sleeps a service
  * @param id: the id of the mailbox
  * @param service: the service to awaken
  */
  sleepService (...args) {
    if (process.type === 'browser') {
      const [id, service] = args
      return { id, service }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('sleepService', args)
    }
  }

  /**
  * Wakes up a service from sleep
  * @param id: the id of the mailbox
  * @param service: the service to awaken
  */
  awakenService (...args) {
    if (process.type === 'browser') {
      const [id, service] = args
      return { id, service }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('awakenService', args)
    }
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Changes the active mailbox
  * @param id: the id of the mailbox
  * @param service=default: the service to change to
  */
  changeActive (...args) {
    if (process.type === 'browser') {
      const [id, service = CoreMailbox.SERVICE_TYPES.DEFAULT] = args
      return { id, service }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActive', args)
    }
  }

  /**
  * Changes the active mailbox to the previous in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveToPrev (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveToPrev', args)
    }
  }

  /**
  * Changes the active mailbox to the next in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveToNext (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveToNext', args)
    }
  }

  /**
  * Changes the active service to the one at the supplied index. If there
  * is no service this will just fail silently
  */
  changeActiveServiceIndex (...args) {
    if (process.type === 'browser') {
      const [index] = args
      return { index }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveServiceIndex', args)
    }
  }

  /**
  * Changes the active service to the previous in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveServiceToPrev (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveServiceToPrev', args)
    }
  }

  /**
  * Changes the active service to the next in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveServiceToNext (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveServiceToNext', args)
    }
  }

  /* **************************************************************************/
  // Mailbox auth teardown
  /* **************************************************************************/

  /**
  * Clears the browser session for a mailbox
  * @param mailboxId: the id of the mailbox to clear
  */
  clearMailboxBrowserSession (...args) {
    if (process.type === 'browser') {
      const [mailboxId] = args
      return { mailboxId }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('clearMailboxBrowserSession', args)
    }
  }

  /**
  * Clears all the browser sessions
  */
  clearAllBrowserSessions (...args) {
    if (process.type === 'browser') {
      return { }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('clearAllBrowserSessions', args)
    }
  }
}

export default CoreMailboxActions
