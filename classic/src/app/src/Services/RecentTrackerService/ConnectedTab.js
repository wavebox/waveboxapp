import uuid from 'uuid'
import { accountActions } from 'stores/account'

const privTabId = Symbol('privTabId')
const privWindowType = Symbol('privWindowType')
const privServiceId = Symbol('privServiceId')
const privPending = Symbol('privPending')
const privPendingDequeue = Symbol('privPendingDequeue')
const privTrackingId = Symbol('privTrackingId')

class ConnectedTab {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param tabId: the id of the tab
  * @param windowType: the type of window
  * @param serviceId: the id of the service
  */
  constructor (tabId, windowType, serviceId) {
    this[privTabId] = tabId
    this[privWindowType] = windowType
    this[privServiceId] = serviceId
    this[privPending] = null
    this[privPendingDequeue] = null
    this[privTrackingId] = uuid.v4()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get tabId () { return this[privTabId] }
  get windowType () { return this[privWindowType] }
  get serviceId () { return this[privServiceId] }
  get hasPending () { return !!this[privPending] }
  get trackingId () { return this[privTrackingId] }

  /* ****************************************************************************/
  // Navigation
  /* ****************************************************************************/

  /**
  * Starts a new page navigation
  * @param url: the url that opened
  * @param title: the title of the page
  */
  startNavigation (url, title) {
    this[privTrackingId] = uuid.v4()
    this[privPending] = {
      url: url,
      title: title,
      favicons: []
    }
    clearTimeout(this[privPendingDequeue])
    this[privPendingDequeue] = this._dequeuePending()
  }

  /**
  * Starts a new in-page navigation
  * @param url: the url that opened
  * @param title: the title of the page
  */
  startInPageNavigation (url, title) {
    if (this.hasPending) {
      this[privPending].url = url
      this[privPending].title = title
    } else {
      this[privTrackingId] = uuid.v4()
      accountActions.addRecent(
        this.serviceId,
        this.trackingId,
        this.tabId,
        this.windowType,
        url,
        title,
        []
      )
    }
  }

  /* ****************************************************************************/
  // Updates
  /* ****************************************************************************/

  /**
  * Indicates the tab focused
  */
  focus () {
    if (!this.hasPending) {
      accountActions.focusRecent(this.serviceId, this.trackingId)
    }
  }

  /**
  * Sets the title on the tab
  * @param val: the title to set
  */
  setTitle (val) {
    if (this.hasPending) {
      this[privPending].title = val
    } else {
      accountActions.updateRecentTitle(this.serviceId, this.trackingId, val)
    }
  }

  /**
  * Sets the title on the tab
  * @param val: the favicons to set
  */
  setFavicons (val) {
    if (this.hasPending) {
      this[privPending].favicons = val
    } else {
      accountActions.updateRecentFavicons(this.serviceId, this.trackingId, val)
    }
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Prepares to dequeue the pending request
  * @return timer
  */
  _dequeuePending () {
    return setTimeout(() => {
      if (!this.hasPending) { return }
      accountActions.addRecent(
        this.serviceId,
        this.trackingId,
        this.tabId,
        this.windowType,
        this[privPending].url,
        this[privPending].title,
        this[privPending].favicons
      )
      this[privPending] = null
    }, 5000)
  }
}

export default ConnectedTab
