import { webContents } from 'electron'
import SessionManager from 'SessionManager/SessionManager'
const privListeners = Symbol('privListeners')

class ElectronWebContentsWillNavigateShim {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @Thomas101 for more info...
  * This module shims a will-navigate callback for webContents. It provides a work
  * around for electron/issues/14751
  */
  constructor () {
    // An array is sub-optimal for modifications but we want to keep
    // the listeners ordered
    this[privListeners] = []
  }

  /* ****************************************************************************/
  // Listeners
  /* ****************************************************************************/

  /**
  * Adds a new listener
  * @param wc: the webcontents to add to
  * @param listener: the listener to attach
  */
  on (...args) {
    return this.addListener(...args)
  }

  /**
  * Adds a new listener
  * @param wc: the webcontents to add to
  * @param listener: the listener to attach
  */
  addListener (wc, listener) {
    const wcId = wc.id
    const isNew = this[privListeners].findIndex((rec) => rec.ses === wc.session) === -1

    this[privListeners].push({ wcId: wcId, ses: wc.session, listener: listener })
    wc.on('destroyed', () => this.removeWebContents(wcId))

    if (isNew) {
      SessionManager
        .webRequestEmitterFromSession(wc.session)
        .beforeRequest
        .onBlocking(undefined, this._handleBeforeRequest)
    }
  }

  /**
  * Removes a listener
  * @param listener: the listener to remove
  */
  removeListener (listener) {
    this._removeListenerRecs(
      this[privListeners].filter((rec) => rec.listener === listener)
    )
  }

  /**
  * Removes a webcontents
  * @param wcId: the id of the webcontents
  */
  removeWebContents (wcId) {
    this._removeListenerRecs(
      this[privListeners].filter((rec) => rec.wcId === wcId)
    )
  }

  /**
  * Removes an array of records
  * @param recs: an array of records to remove
  */
  _removeListenerRecs (recs) {
    if (!recs.length) { return }
    const recsIndex = new Set(recs)

    this[privListeners] = this[privListeners]
      .filter((rec) => !recsIndex.has(rec))

    // Unlisted to any sessions that are no longer in use
    const touchedSessions = Array.from(new Set(
      recs.map((rec) => rec.ses)
    ))
    touchedSessions.forEach((ses) => {
      SessionManager
        .webRequestEmitterFromSession(ses)
        .beforeRequest
        .removeListener(this._handleBeforeRequest)
    })
  }

  /* ****************************************************************************/
  // Web Request handlers
  /* ****************************************************************************/

  /**
  * Handles a request firing out
  * @param details: the request details
  * @param responder: the responder to call
  */
  _handleBeforeRequest = (details, responder) => {
    if (details.resourceType !== 'mainFrame') { return responder({}) }
    if ((details.url || 'about:blank') === 'about:blank') { return responder({}) }

    const listeners = this[privListeners]
      .filter((rec) => rec.wcId === details.webContentsId)
    if (!listeners.length) { return responder({}) }

    const sender = webContents.fromId(details.webContentsId)
    if (!sender || sender.isDestroyed()) { return responder({}) }
    if ((sender.getURL() || 'about:blank') === 'about:blank') { return responder({}) }

    // Now we have everything run the callbacks
    let defaultPrevented = false
    const preventDefault = () => { defaultPrevented = true }

    listeners.find((rec) => {
      try {
        rec.listener({ preventDefault, sender }, details.url)
      } catch (ex) {
        /* no-op */
      }
      return defaultPrevented
    })

    return responder(defaultPrevented ? { cancel: true } : {})
  }
}

export default new ElectronWebContentsWillNavigateShim()
