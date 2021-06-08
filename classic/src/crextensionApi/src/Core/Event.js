class Event {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/events
  */
  constructor () {
    this.listeners = []
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Add & Remove
  /* **************************************************************************/

  addListener (callback) {
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

export default Event
