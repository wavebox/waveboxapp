const { EventEmitter } = require('events')

class MailboxDispatch extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.__responders__ = {}
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
  * Fetches the process memory info for all webviews
  * @return promise with the array of infos
  */
  fetchProcessMemoryInfo () {
    return this.request('fetch-process-memory-info')
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

module.exports = new MailboxDispatch()
