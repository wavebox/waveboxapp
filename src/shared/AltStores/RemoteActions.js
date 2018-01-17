import { ipcRenderer } from 'electron'

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
    ipcRenderer.send(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.name.dispatch}`, fnName, args)
    return {}
  }

  /**
  * Connects to the remote store
  * @return the response the remote store gave
  */
  remoteConnect () {
    if (process.type !== 'renderer') {
      throw new Error('"actions.remoteConnect" is only available in the renderer thread')
    }
    return ipcRenderer.sendSync(`ALT:CONNECT:${this.__remote__.name.dispatch}`)
  }
}

export default RemoteActions
