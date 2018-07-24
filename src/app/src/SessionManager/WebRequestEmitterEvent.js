import { URL } from 'url'

class WebRequestEmitterEvent {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param supportsBlocking: true if this supports blocking
  * @param bind: a function to call to bind to the webrequest
  */
  constructor (supportsBlocking, bind) {
    this._supportsBlocking = supportsBlocking
    this._bind = bind
    this._listeners = []

    if (!supportsBlocking) {
      delete this.onBlocking
    }
  }

  /* ****************************************************************************/
  // Registering
  /* ****************************************************************************/

  /**
  * Registers the event listener
  * @param filterUrls: the list of urls to match with
  * @param listener: the listener to call on event
  */
  on (filterUrls, listener) {
    this._listeners.push({ filter: filterUrls, fn: listener, blocking: false })
    this._configureListener()
  }

  /**
  * Registers the event listener in a blocking fasion
  * @param filterUrls: the list of urls to match with
  * @param listener: the listener to call on event
  */
  onBlocking (filterUrls, listener) {
    this._listeners.push({ filter: filterUrls, fn: listener, blocking: true })
    this._configureListener()
  }

  /**
  * Removes a listener
  * @param listener: the listener to remove
  */
  removeListener (listener) {
    const prevLength = this._listeners.length
    this._listeners = this._listeners.filter((l) => l.fn !== listener)
    if (prevLength !== this._listeners.length) {
      this._configureListener()
    }
  }

  /**
  * Removes all listeners
  */
  removeAllListeners () {
    this._listeners = []
    this._configureListener()
  }

  /* ****************************************************************************/
  // Emitting
  /* ****************************************************************************/

  /**
  * Handles the emit process
  * @param details: the details that were passed in
  * @param maybeCallback: a callback, if this is a blocking request
  */
  _handleEmit = (details, maybeCallback) => {
    try {
      if (this._supportsBlocking) {
        this._emitBlocking(details, maybeCallback)
      }
      this._emitNonBlocking(details)
    } catch (ex) {
      // Make sure if something goes wrong we don't bork a request completely
      if (this._supportsBlocking) {
        const response = {}
        maybeCallback(response)
      }
    }
  }

  /**
  * Emits the non-blocking calls
  * @param details: the details that were passed in
  */
  _emitNonBlocking = (details) => {
    const parsedTargetUrl = new URL(details.url)

    this._listeners.forEach((listener) => {
      if (listener.blocking) { return }
      if (!this._matchesUrlFilter(parsedTargetUrl, listener.filter)) { return }

      try {
        listener.fn(details)
      } catch (ex) { }
    })
  }

  /**
  * Emits the blocking calls
  * @param details: the details that were passed in
  * @param maybeCallback: a callback, if this is a blocking request
  */
  _emitBlocking = (details, callback) => {
    const parsedTargetUrl = new URL(details.url)

    Promise.resolve()
      .then(() => {
        return this._listeners.reduce((acc, listener) => {
          if (!listener.blocking) { return acc }
          if (!this._matchesUrlFilter(parsedTargetUrl, listener.filter)) { return acc }

          return acc.then((prevResponse) => {
            return new Promise((resolve) => {
              try {
                listener.fn(details, (res) => {
                  if (!res || typeof (res) !== 'object' || Object.keys(res).length === 0) {
                    resolve(prevResponse)
                  } else {
                    resolve(res)
                  }
                })
              } catch (ex) {
                console.warn([
                  'blocking session.webRequest threw an unknown exception.',
                  'This was caught and execution continues, but the side-effect will be unknown',
                  ''
                ].join('\n'), ex)
                resolve(prevResponse)
              }
            })
          })
        }, Promise.resolve({}))
      })
      .then((response) => {
        callback(response)
      })
      .catch(() => {
        const response = {}
        callback(response)
      })
  }

  /* ****************************************************************************/
  // Setup
  /* ****************************************************************************/

  /**
  * Gets the full set of filter urls
  * @return a list of unique filter urls
  */
  _getFilterUrls () {
    const hasAll = this._listeners.findIndex((l) => !l.filter || !l.filter.length) !== -1
    if (hasAll) { return undefined }

    const filterList = this._listeners.reduce((acc, l) => {
      return acc.concat(l.filter)
    }, [])

    return Array.from(new Set(filterList))
  }

  /**
  * Configures the listener to the core emitter
  */
  _configureListener () {
    if (this._listeners.length === 0) {
      this._bind(undefined, null)
    } else {
      const filters = this._getFilterUrls()
      this._bind(filters, this._handleEmit)
    }
  }

  /* ****************************************************************************/
  // Url matching
  /* ****************************************************************************/

  /**
  * Matches the url filters
  * @param parsedTargetUrl: the parsed version of the target url
  * @param filter: the array of filter strings
  * @return true if this matches
  */
  _matchesUrlFilter (parsedTargetUrl, filter) {
    if (!filter || !filter.length) { return true }

    const matchUrl = `${parsedTargetUrl.protocol}//${parsedTargetUrl.host}${parsedTargetUrl.pathname}`

    const match = filter.find((pattern) => {
      const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      return matchUrl.match(regexp) !== null
    })

    return !!match
  }
}

export default WebRequestEmitterEvent
