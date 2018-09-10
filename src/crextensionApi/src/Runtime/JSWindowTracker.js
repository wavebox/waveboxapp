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
      if (this[privWindows].get(k).window.closed) {
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
  * @param viewType: the type of view
  * @param w: the window to add
  */
  add (wcId, viewType, w) {
    if (!w.closed) {
      this[privWindows].set(wcId, { wcId: wcId, viewType: viewType, window: w })
    }
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Gets all the windows an an array with wcId included
  * @return an array of { window, viewType, wcId }
  */
  allArray () {
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
    return (this[privWindows].get(wcId) || {}).window
  }
}

export default JSWindowTracker
