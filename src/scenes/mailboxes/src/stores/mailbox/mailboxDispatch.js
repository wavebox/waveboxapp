import { EventEmitter } from 'events'

class MailboxDispatch extends EventEmitter {
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
  // Responders : Higher level
  /* **************************************************************************/

  /**
  * Asks the mailbox to submit its resource usage
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param description: the description that should be returned in the pong
  */
  pingResourceUsage (mailboxId, serviceType, description) {
    return this.emit('ping-resource-usage', {
      mailboxId: mailboxId,
      serviceType: serviceType,
      description: description
    })
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
  * @param mailboxId: the id of the mailbox
  * @return promise with the current url
  */
  getCurrentUrl (mailboxId, serviceType) {
    return this.requestGetter('current-url', { mailboxId: mailboxId, serviceType: serviceType })
  }

  /* **************************************************************************/
  // Event Fires : Dev
  /* **************************************************************************/

  /**
  * Emits a open dev tools command
  * @param mailboxId: the id of the mailbox
  * @param service: the service to open for
  */
  openDevTools (mailboxId, service) {
    this.emit('devtools', { mailboxId: mailboxId, service: service })
  }

  /* **************************************************************************/
  // Event Fires : Reloading
  /* **************************************************************************/

  /**
  * Reloads a mailbox
  * @param mailboxId: the id of mailbox
  * @param service: the service of the mailbox
  */
  reload (mailboxId, service) {
    this.emit('reload', { mailboxId: mailboxId, service: service, allServices: false })
  }

  /**
  * Reloads all mailboxes services with the given id
  * @param mailboxId: the id of mailbox
  */
  reloadAllServices (mailboxId) {
    this.emit('reload', { mailboxId: mailboxId, allServices: true })
  }

  /* **************************************************************************/
  // Event Fires : Focus
  /* **************************************************************************/

  /**
  * Emits a focus event for a mailbox
  * @param mailboxId=undefined: the id of the mailbox
  * @param service=undefined: the service of the mailbox
  */
  refocus (mailboxId = undefined, service = undefined) {
    this.emit('refocus', { mailboxId: mailboxId, service: service })
  }

  /**
  * Emis a blurred event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the service of the mailbox
  */
  blurred (mailboxId, service) {
    this.emit('blurred', { mailboxId: mailboxId, service: service })
  }

  /**
  * Emis a focused event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the service of the mailbox
  */
  focused (mailboxId, service) {
    this.emit('focused', { mailboxId: mailboxId, service: service })
  }

  /* **************************************************************************/
  // Event Fires : Linking
  /* **************************************************************************/

  /**
  * Emits an open item event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the type of service
  * @param data: the data to pass along with the request
  */
  openItem (mailboxId, service, data) {
    this.emit('openItem', { mailboxId: mailboxId, service: service, data: data })
  }

  /**
  * Composes a new item in a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the type of service
  * @param data: the data to pass along with the request
  */
  composeItem (mailboxId, service, data) {
    this.emit('composeItem', { mailboxId: mailboxId, service: service, data: data })
  }
}

export default new MailboxDispatch()
