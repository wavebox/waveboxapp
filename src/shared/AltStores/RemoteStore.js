import electron from 'electron'
import { UNIVERSAL_DISPATCH_KEY } from './UniversalDispatch'

class RemoteStore {
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
      },
      connected: process.type === 'browser' ? new Set() : undefined
    }

    /* ****************************************/
    // Remote
    /* ****************************************/

    if (process.type === 'browser') {
      electron.ipcMain.on(`ALT:CONNECT:${this.__remote__.names.dispatch}`, this._remoteHandleConnect)
      electron.ipcMain.on(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.names.dispatch}`, this._remoteHandleDispatch)
    } else if (process.type === 'renderer') {
      electron.ipcRenderer.on(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.names.dispatch}`, this._remoteHandleDispatch)
    }
  }

  /* **************************************************************************/
  // Remote handlers
  /* **************************************************************************/

  _remoteHandleConnect = (evt) => {
    try {
      if (process.type !== 'browser') {
        evt.returnValue = null
        return
      }

      const senderId = evt.sender.id
      if (!this.__remote__.connected.has(senderId)) {
        this.__remote__.connected.add(senderId)
        evt.sender.once('destroyed', () => {
          this.__remote__.connected.delete(senderId)
        })
      }

      evt.returnValue = this._remoteConnectReturnValue()
    } catch (ex) {
      console.error(`Failed to respond to "ALT:CONNECT:${this.__remote__.names.dispatch}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Provides an overwritable hook to return data to a clien on connect
  * @return an object to return to the remote client
  */
  _remoteConnectReturnValue () {
    return {}
  }

  /**
  * Handles a remote store dispatching
  * @param evt: the event that fired
  * @param fnName: the function name to dispatch
  * @param args: the arguments to dispatch with
  */
  _remoteHandleDispatch = (evt, fnName, args) => {
    const actions = this.alt.getActions(this.__remote__.names.actions)
    actions[fnName](...args)
  }

  /* **************************************************************************/
  // Remote tools
  /* **************************************************************************/

  /**
  * Dispatches a call on all the connected clients
  * @param fnName: the name of the method to dispatch
  * @param args: the arguments to supply
  */
  dispatchToRemote (fnName, args) {
    if (process.type === 'browser') {
      Array.from(this.__remote__.connected).forEach((wcId) => {
        const wc = electron.webContents.fromId(wcId)
        if (wc) {
          wc.send(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.names.dispatch}`, fnName, args)
        }
      })
    } else if (process.type === 'renderer') {
      electron.ipcRenderer.send(`ALT:DISPATCH_REMOTE_ACTION:${this.__remote__.names.dispatch}`, fnName, args)
    }
  }

  /**
  * Dispatches to a universal listener in the connected clients
  * @param fnName: the name of the method to dispatch
  * @param args: the arguments to supply
  */
  dispatchToUniversalRemote (fnName, args) {
    this.dispatchToRemote(fnName, [UNIVERSAL_DISPATCH_KEY].concat(args))
  }
}

export default RemoteStore
