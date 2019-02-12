import { EventEmitter } from 'events'

const privMount = Symbol('privMount')

class RouterModalManager extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privMount] = new Map()
  }

  /* **************************************************************************/
  // Controller Events
  /* **************************************************************************/

  /**
  * Indicates that a controller mounted
  * @param name: the name of the component
  * @param instanceId: the id of the component
  * @param match: the router match object
  * @param location: the location match object
  */
  controllerDidMount (name, instanceId, match, location) {
    if (this[privMount].has(name)) {
      this[privMount].get(name).match = match
      this[privMount].get(name).location = location
      this[privMount].get(name).instanceId = instanceId
      this.emit(`route-${name}-changed`, { sender: this, instanceId: instanceId }, match, location)
    } else {
      this[privMount].set(name, { instanceId: instanceId, match: match, location: location })
      this.emit(`mount-${name}`, { sender: this, instanceId: instanceId }, match, location)
    }
  }

  /**
  * Indicates that a controller unmounted
  * @param name: the name of the component
  * @param instanceId: the id of the component
  */
  controllerDidUnmount (name, instanceId) {
    if (this[privMount].has(name) && this[privMount].get(name).instanceId === instanceId) {
      this.emit(`unmount-${name}`, { sender: this, instanceId: instanceId })
      this[privMount].delete(name)
    }
  }

  /**
  * Updates the match for the controller
  * @param name: the name of the component
  * @param instanceId: the id of the component
  * @param match: the router match object
  * @param location: the location match object
  */
  updateControllerMatch (name, instanceId, match, location) {
    if (this[privMount].has(name) && this[privMount].get(name).instanceId === instanceId) {
      this[privMount].get(name).match = match
      this[privMount].get(name).location = location
      this.emit(`route-${name}-changed`, { sender: this, instanceId: instanceId }, match, location)
    }
  }

  /* **************************************************************************/
  // Query
  /* **************************************************************************/

  /**
  * @param name: the name of the controller
  * @return true if the component is mounted, false otherwise
  */
  controllerIsMounted (name) {
    return this[privMount].has(name)
  }

  /**
  * @param name: the name of the controller
  * @return the match or undefined
  */
  controllerMatch (name) {
    return (this[privMount].get(name) || {}).match
  }

  /**
  * @param name: the name of the controller
  * @return the location or undefined
  */
  controllerLocation (name) {
    return (this[privMount].get(name) || {}).location
  }
}

export default RouterModalManager
