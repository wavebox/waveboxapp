const privEventName = Symbol('privEventName')

class EventUnsupported {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/events
  * @param eventName: the name of the event
  */
  constructor (eventName) {
    this[privEventName] = eventName
    this.listeners = []
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Add & Remove
  /* **************************************************************************/

  addListener (callback) {
    console.warn(`${this[privEventName]} is not supported by Wavebox at this time. Adding listeners will have no effect`)
    this.listeners.push(callback)
  }

  removeListener (callback) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  /* **************************************************************************/
  // Query
  /* **************************************************************************/

  hasListener (callback) {
    return this.listeners.indexOf(callback) !== -1
  }

  hasListeners () {
    return this.listeners.length !== 0
  }

  /* **************************************************************************/
  // Emitting
  /* **************************************************************************/

  emit (...args) {
    for (const listener of this.listeners) {
      listener(...args)
    }
  }
}

export default EventUnsupported
