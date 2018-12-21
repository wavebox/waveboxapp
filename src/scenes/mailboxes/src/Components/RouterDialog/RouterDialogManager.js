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
  */
  controllerDidMount (name, instanceId, match) {
    if (this[privMount].has(name)) {
      this[privMount].get(name).match = match
      this[privMount].get(name).instanceId = instanceId
      this.emit(`match-${name}-changed`, { sender: this, instanceId: instanceId }, match)
    } else {
      this[privMount].set(name, { instanceId: instanceId, match: match })
      this.emit(`mount-${name}`, { sender: this, instanceId: instanceId }, match)
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
  */
  updateControllerMatch (name, instanceId, match) {
    if (this[privMount].has(name) && this[privMount].get(name).instanceId === instanceId) {
      this[privMount].get(name).match = match
      this.emit(`match-${name}-changed`, { sender: this, instanceId: instanceId }, match)
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
    return this[privMount].get(name).match
  }
}

export default RouterModalManager
