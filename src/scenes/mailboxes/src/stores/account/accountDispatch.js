import { EventEmitter } from 'events'

class AccountDispatch extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.__responders__ = {}
    this.__getters__ = {}
  }

  /* **************************************************************************/
  // Responders
  /* **************************************************************************/

  /**
  * Adds a responder
  * @param name: the name of the responder
  * @param fn: the function to respond with
  */
  respond (name, fn) {
    if (this.__responders__[name]) {
      this.__responders__[name].push(fn)
    } else {
      this.__responders__[name] = [fn]
    }
  }

  /**
  * Unregisteres a responder
  * @param name: the name of the responder
  * @param fn: the function to remove
  */
  unrespond (name, fn) {
    if (this.__responders__[name]) {
      this.__responders__[name] = this.__responders__[name].filter((f) => f !== fn)
    }
  }

  /**
  * Makes a fetch to a set of responders
  * @param name: the name of the responder to call
  * @param args=undefined: arguments to pass to the responders
  * @param timeout=undefined: set to a ms to provide a timeout
  * @return promise
  */
  request (name, args = undefined, timeout = undefined) {
    if (!this.__responders__[name] || this.__responders__[name].length === 0) {
      return Promise.resolve([])
    }

    const requestPromise = Promise.all(this.__responders__[name].map((fn) => fn(args)))
    if (timeout === undefined) {
      return requestPromise
    } else {
      return Promise.race([
        requestPromise,
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Request Timeout')), timeout)
        })
      ])
    }
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Adds a getter that will respond to an event
  * @param name: the name of the getter
  * @param fn: the function that acts as the getter
  */
  addGetter (name, fn) {
    if (this.__getters__[name]) {
      this.__getters__[name].push(fn)
    } else {
      this.__getters__[name] = [fn]
    }
  }

  /**
  * Removes a getter
  * @param name: the name of the getter
  * @param fn: the function to remove
  */
  removeGetter (name, fn) {
    if (this.__getters__[name]) {
      this.__getters__[name] = this.__getters__[name].filter((f) => f !== fn)
    }
  }

  /**
  * Makes a request on a getter
  * @param mailboxId: the id of the mailbox
  * @param name: the name of the getter
  * @return the response or undefined if no getter is available
  */
  requestGetter (name, args = undefined, multiple = false) {
    const getters = this.__getters__[name] || []
    if (multiple) {
      return getters.reduce((acc, fn) => {
        const res = fn(args)
        if (res !== null) { acc.push(res) }
        return acc
      }, [])
    } else {
      let returnValue = null
      getters.find((fn) => {
        const res = fn(args)
        if (res === null) {
          return false
        } else {
          returnValue = res
          return true
        }
      })
      return returnValue
    }
  }

  /* **************************************************************************/
  // Getters : Higher level
  /* **************************************************************************/

  /**
  * Gets the current url for a mailbox
  * @param serviceId: the id of the service
  * @return promise with the current url
  */
  getCurrentUrl (serviceId) {
    return this.requestGetter('current-url', { serviceId: serviceId })
  }

  /* **************************************************************************/
  // Event Fires : Dev
  /* **************************************************************************/

  /**
  * Emits a open dev tools command
  * @param serviceId: the id of the service
  */
  openDevTools (serviceId) {
    this.emit('devtools', { serviceId: serviceId })
  }

  /* **************************************************************************/
  // Event Fires : Reloading
  /* **************************************************************************/

  /**
  * Reloads a service
  * @param serviceId: the id of the service
  */
  reloadService (serviceId) {
    this.emit('reload', { serviceId: serviceId })
  }

  /**
  * Reloads all mailboxes services with the given id
  * @param mailboxId: the id of mailbox
  */
  reloadMailbox (mailboxId) {
    this.emit('reload', { mailboxId: mailboxId })
  }

  /* **************************************************************************/
  // Event Fires : Navigating
  /* **************************************************************************/

  /**
  * Navigates the active mailbox back
  */
  navigateBack () {
    this.emit('navigateBack', {})
  }

  /**
  * Navigates the active mailbox forward
  */
  navigateForward () {
    this.emit('navigateForward', {})
  }

  /* **************************************************************************/
  // Event Fires : Focus
  /* **************************************************************************/

  /**
  * Emits a focus event for a mailbox
  * @param serviceId=undefined: the id of the service
  */
  refocus (serviceId) {
    this.emit('refocus', { serviceId: serviceId })
  }

  /**
  * Emis a blurred event for a mailbox
  * @param serviceId: the id of the service
  */
  blurred (serviceId) {
    this.emit('blurred', { serviceId: serviceId })
  }

  /**
  * Emis a focused event for a mailbox
  * @param serviceId: the id of the service
  */
  focused (serviceId) {
    this.emit('focused', { serviceId: serviceId })
  }

  /* **************************************************************************/
  // Event Fires : Linking
  /* **************************************************************************/

  /**
  * Emits an open item event for a mailbox
  * @param serviceId: the id of the service
  * @param data: the data to pass along with the request
  */
  openItem (serviceId, data) {
    this.emit('openItem', { serviceId: serviceId, data: data })
  }

  /**
  * Composes a new item in a mailbox
  * @param serviceId: the id of the service
  * @param data: the data to pass along with the request
  */
  composeItem (serviceId, data) {
    this.emit('composeItem', { serviceId: serviceId, data: data })
  }
}

export default new AccountDispatch()
