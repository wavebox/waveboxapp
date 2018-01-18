import electron from 'electron'
import { UNIVERSAL_DISPATCH_KEY } from './UniversalDispatch'

class RemoteActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param dispatchName: the unique identifier to use when dispatching
  * @param actionsName: the name given to the actions
  * @param storeName: the name given to the store
  */
  constructor (dispatchName, actionsName, storeName) {
    this.__remote__ = {
      names: {
        dispatch: dispatchName,
        actions: actionsName,
        store: storeName
      }
    }
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Dispatches a remote call
  * @param fnName: the remote function name
  * @param args: the args to give the call
  */
  remoteDispatch (fnName, args) {
    if (process.type !== 'renderer') {
      throw new Error('"actions.remoteDispatch" is only available in the renderer thread')
    }
    electron.ipcRenderer.send(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.names.dispatch}`, fnName, args)
    return Promise.resolve(fnName)
  }

  /**
  * Connects to the remote store
  * @return the response the remote store gave
  */
  remoteConnect () {
    if (process.type !== 'renderer') {
      throw new Error('"actions.remoteConnect" is only available in the renderer thread')
    }
    return electron.ipcRenderer.sendSync(`ALT:CONNECT:${this.__remote__.names.dispatch}`)
  }

  /**
  * Routes an action universally so it can be dispatched from anywhere
  * but handled correctly
  * @param fnName: the function name if we need to dispatch over the bridge
  * @param args: the array of arguments
  * @param handler: the handler to return the dispatchable
  */
  universalDispatch (fnName, args, handler) {
    if (process.type === 'browser') {
      return handler(...args)
    } else if (process.type === 'renderer') {
      if (args[0] === UNIVERSAL_DISPATCH_KEY) {
        return handler(...args.slice(1))
      } else {
        return this.remoteDispatch(fnName, args)
      }
    }
  }
}

export default RemoteActions
