import { ipcRenderer } from 'electronCrx'
import uuid from 'uuid'

const privFriendlyEventName = Symbol('privFriendlyEventName')
const privAddEventName = Symbol('privAddEventName')
const privRemoveEventName = Symbol('privRemoveEventName')
const privTriggerEventName = Symbol('privTriggerEventName')

const OPTIONAL_UNSUPPORTED = [
  'blocking'
]

class WebRequestEvent {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param friendlyEventName: the friendly event name, used in errors and logging
  * @param addEventName: the name of the event used to add a listener
  * @param removeEventName: the name of the event used to remove a listener
  * @param triggerEventName: the name of the event that triggers
  */
  constructor (friendlyEventName, addEventName, removeEventName, triggerEventName) {
    this[privFriendlyEventName] = friendlyEventName
    this[privAddEventName] = addEventName
    this[privRemoveEventName] = removeEventName
    this[privTriggerEventName] = triggerEventName

    this._listeners = new Map()

    // Listeners
    ipcRenderer.on(this[privTriggerEventName], (evt, id, details) => {
      if (!this._listeners.has(id)) { return }
      this._listeners.get(id)(details)
    })
  }

  /* **************************************************************************/
  // Add & Remove
  /* **************************************************************************/

  /**
  * Adds a listener
  * @param callback: the callback to execute
  * @param filter=undefined: the lister options
  * @param optExtraInfoSpec=undefined: the optional configuration options
  */
  addListener (callback, filter = undefined, optExtraInfoSpec = undefined) {
    if (optExtraInfoSpec) {
      const unsupported = OPTIONAL_UNSUPPORTED.filter((n) => optExtraInfoSpec.indexOf(n) !== -1)
      if (unsupported.length) {
        console.warn([
          `chrome.webRequest.${this[privFriendlyEventName]}.addListener`,
          'does not support the following options',
          `"[${unsupported.join(',')}]"`,
          'in Wavebox at this time. They will be ignored'
        ].join(' '))
      }
    }

    const id = uuid.v4()
    this._listeners.set(id, callback)
    ipcRenderer.send(this[privAddEventName], id, filter, optExtraInfoSpec)
  }

  /**
  * Removes a listener
  * @param callback: the callback to remove
  */
  removeListener (callback) {
    const removeKeys = Array.from(this._listeners.keys()).filter((k) => {
      return this._listeners.get(k) === callback
    })

    removeKeys.forEach((id) => {
      this._listeners.delete(id)
      ipcRenderer.send(this[privRemoveEventName], id)
    })
  }

  /* **************************************************************************/
  // Query
  /* **************************************************************************/

  hasListener (callback) {
    return !!Array.from(this._listeners.values()).find((c) => c === callback)
  }

  hasListeners () {
    return this._listeners.size !== 0
  }
}

export default WebRequestEvent
