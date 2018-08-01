const privWindows = Symbol('privWindows')

class JSWindowTracker {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privWindows] = new Map()
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  _filterDead () {
    Array.from(this[privWindows].keys()).forEach((k) => {
      if (this[privWindows].get(k).closed) {
        this[privWindows].delete(k)
      }
    })
  }

  /* **************************************************************************/
  // Setters
  /* **************************************************************************/

  /**
  * Adds a new window to the stack
  * @param wcId: the id of the backing webcontenst
  * @param w: the window to add
  */
  add (wcId, w) {
    if (!w.closed) {
      this[privWindows].set(wcId, w)
    }
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Gets all the windows an object keyed by wcid
  * @return an object of wcId to window
  */
  all () {
    this._filterDead()
    return Array.from(this[privWindows].keys()).reduce((acc, wcId) => {
      acc[wcId] = this[privWindows].get(wcId)
      return acc
    }, {})
  }

  /**
  * Gets all the windows an an array with wcId included
  * @return an array of { window, wcId }
  */
  allArray () {
    return Array.from(this[privWindows].keys()).map((wcId) => {
      return { wcId: wcId, window: this[privWindows].get(wcId) }
    })
  }

  /**
  * Gets all the windows
  * @return an array of window objects
  */
  allWindows () {
    this._filterDead()
    return Array.from(this[privWindows].values())
  }

  /**
  * Gets a window for a webcontentsid
  * @param wcId: the id of the webcontents
  * @return the window for the webcontents if available
  */
  windowForWcId (wcId) {
    this._filterDead()
    return this[privWindows].get(wcId)
  }
}

export default JSWindowTracker
