import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltAccountIdentifiers'
import MailboxReducerManifest from './MailboxReducers/MailboxReducerManifest'
import ServiceReducerManifest from './ServiceReducers/ServiceReducerManifest'
import ServiceDataReducerManifest from './ServiceDataReducers/ServiceDataReducerManifest'
import AuthReducerManifest from './AuthReducers/AuthReducerManifest'

class CoreAccountActions extends RemoteActions {
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
  * @param data: the data to create it with
  */
  createMailbox (...args) {
    if (process.type === 'browser') {
      const [data] = args
      return { data }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('createMailbox', args)
    }
  }

  /**
  * Removes a mailbox
  * @param id: the id of the mailbox to update
  */
  removeMailbox (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('removeMailbox', args)
    }
  }

  /**
  * Updates and modifies a mailbox
  * @param id: the id of the mailbox to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceMailbox (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = MailboxReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Mailbox Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = MailboxReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Mailbox Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceMailbox', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Changes the index of a mailbox
  * @param id: the id of the mailbox to move
  * @param nextIndex: the next index to place the mailbox
  */
  changeMailboxIndex (...args) {
    if (process.type === 'renderer') {
      this.remoteDispatch('changeMailboxIndex', args)
    }

    const [id, nextIndex] = args
    return { id, nextIndex }
  }

  /**
  * Sets a custom avatar on a mailbox
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setCustomAvatarOnMailbox (...args) {
    if (process.type === 'browser') {
      const [id, b64Image] = args
      return { id, b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setCustomAvatarOnMailbox', args)
    }
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Creates a new auth
  * @param data: the data to create it with
  */
  createAuth (...args) {
    if (process.type === 'browser') {
      const [data] = args
      return { data }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('createAuth', args)
    }
  }

  /**
  * Updates and modifies an auth record
  * @param id: the id of the auth to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceAuth (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = AuthReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Auth Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = AuthReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Auth Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceAuth', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Creates a new auth
  * @param id: the id of the auth
  */
  removeAuth (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('removeAuth', args)
    }
  }

  /* **************************************************************************/
  // Services
  /* **************************************************************************/

  /**
  * Creates a new mailbox
  * @param parentId: the id of the mailbox
  * @param parentLocation to add the new service: the location from Mailbox.SERVICE_UI_LOCATIONS
  * @param data: the data to create it with
  */
  createService (...args) {
    if (process.type === 'browser') {
      const [parentId, parentLocation, data] = args
      return { parentId, parentLocation, data }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('createService', args)
    }
  }

  /**
  * Removes a Service
  * @param id: the id of the service to remove
  */
  removeService (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('removeService', args)
    }
  }

  /**
  * Moves a service to a new mailbox
  * @param id: the id of service to move
  */
  moveServiceToNewMailbox (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('moveServiceToNewMailbox', args)
    }
  }

  /**
  * Updates and modifies a service
  * @param id: the id of the service to change
  * @param reducer: the reducer to run on the service
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceService (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceService', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a service only if it's active
  * @param id: the id of the service to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfActive (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceIfActive', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a service only if it's inactive
  * @param id: the id of the service to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfInactive (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceIfInactive', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a service data
  * @param id: the id of the service to change
  * @param reducer: the reducer to run on the service
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceData (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceDataReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Data Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceDataReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Data Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceData', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a service data only if it's active
  * @param id: the id of the service to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceDataIfActive (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceDataReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Data Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceDataReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Data Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceDataIfActive', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Updates and modifies a service data only if it's inactive
  * @param id: the id of the service to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceDataIfInactive (...args) {
    const [id, reducer, ...reducerArgs] = args

    if (process.type === 'browser') {
      const reducerFn = ServiceDataReducerManifest.parseReducer(reducer)
      if (!reducerFn) {
        throw new Error(`Service Data Reducer could not be found or deseriliazed ${reducer}`)
      }
      return { id: id, reducer: reducerFn, reducerArgs: reducerArgs }
    } else if (process.type === 'renderer') {
      const reducerName = ServiceDataReducerManifest.stringifyReducer(reducer)
      if (!reducerName) {
        throw new Error(`Service Data Reducer could not be found or seriliazed ${reducer}`)
      }
      return this.remoteDispatch('reduceServiceDataIfInactive', [id, reducerName].concat(reducerArgs))
    }
  }

  /**
  * Sets a custom avatar on a service
  * @param id: the id of the service
  * @param b64Image: the image to set
  */
  setCustomAvatarOnService (...args) {
    if (process.type === 'browser') {
      const [id, b64Image] = args
      return { id, b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setCustomAvatarOnService', args)
    }
  }

  /**
  * Sets a service avatar on a service
  * @param id: the id of the service
  * @param b64Image: the image to set
  */
  setServiceAvatarOnService (...args) {
    if (process.type === 'browser') {
      const [id, b64Image] = args
      return { id, b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setServiceAvatarOnService', args)
    }
  }

  /**
  * Changes the service sandboxing state
  * @param id: the id of the service
  * @param sandbox: true to sandbox from the mailbox, false otherwise
  */
  changeServiceSandboxing (...args) {
    if (process.type === 'browser') {
      const [id, sandbox] = args
      return { id, sandbox }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeServiceSandboxing', args)
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
  // Sleeping
  /* **************************************************************************/

  /**
  * Sleeps a service
  * @param id: the id of the service
  */
  sleepService (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('sleepService', args)
    }
  }

  /**
  * Sleeps all services in a mailbox
  * @param id: the id of the mailbox
  */
  sleepAllServicesInMailbox (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('sleepAllServicesInMailbox', args)
    }
  }

  /**
  * Wakes up a service from sleep
  * @param id: the id of the mailbox
  */
  awakenService (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
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
  * @param firstService=false: set to true to go immediately to the first service
  */
  changeActiveMailbox (...args) {
    if (process.type === 'browser') {
      const [id, firstService = false] = args
      return { id, firstService }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveMailbox', args)
    }
  }

  /**
  * Changes the active mailbox to be the one at the given index
  * @param index: the index of the mailbox
  */
  changeActiveMailboxIndex (...args) {
    if (process.type === 'browser') {
      const [index] = args
      return { index }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveMailboxIndex', args)
    }
  }

  /**
  * Changes the active mailbox to the previous in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveMailboxToPrev (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveMailboxToPrev', args)
    }
  }

  /**
  * Changes the active mailbox to the next in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveMailboxToNext (...args) {
    if (process.type === 'browser') {
      const [allowCycling = false] = args
      return { allowCycling }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveMailboxToNext', args)
    }
  }

  /**
  * Changes the active service
  * @param id: the id of the service
  */
  changeActiveService (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveService', args)
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

  /**
  * Changes the active service or mailbox to the next in the list
  */
  changeActiveTabToNext (...args) {
    if (process.type === 'browser') {
      return { }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveTabToNext', args)
    }
  }

  /**
  * Changes the active service or mailbox to the prev in the list
  */
  changeActiveTabToPrev (...args) {
    if (process.type === 'browser') {
      return { }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('changeActiveTabToPrev', args)
    }
  }

  /* **************************************************************************/
  // Mailbox auth teardown
  /* **************************************************************************/

  /**
  * Clears the browser session for a mailbox
  * @param id: the id of the mailbox to clear
  */
  clearMailboxBrowserSession (...args) {
    if (process.type === 'browser') {
      const [id] = args
      return { id }
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

export default CoreAccountActions
