import { BrowserWindow, webContents } from 'electron'

const privAttachedIndex = Symbol('privAttachedIndex')
const privAttached = Symbol('privAttached')

class WaveboxWindowManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privAttachedIndex] = []
    this[privAttached] = new Map()
  }

  /* ****************************************************************************/
  // Adding / Removing
  /* ****************************************************************************/

  /**
  * Attaches a wavebox window
  * @param waveboxWindow: the window that attached
  */
  attach (waveboxWindow) {
    if (this[privAttached].has(waveboxWindow.browserWindowId)) { return }
    this[privAttached].set(waveboxWindow.browserWindowId, waveboxWindow)
    this[privAttachedIndex].push(waveboxWindow.browserWindowId)
  }

  /**
  * Detaches a wavebox window
  * @param waveboxWindow: the window that detached
  */
  detach (waveboxWindow) {
    if (!this[privAttached].has(waveboxWindow.browserWindowId)) { return }
    this[privAttached].delete(waveboxWindow.browserWindowId)

    const index = this[privAttachedIndex].indexOf(waveboxWindow.browserWindowId)
    this[privAttachedIndex].splice(index, 1)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return all the attached wavebox windows
  */
  all () { return Array.from(this[privAttached].values()) }

  /* ****************************************************************************/
  // Getters: Type
  /* ****************************************************************************/

  /**
  * @param Constructor: the type to fetch
  * @return an array of all windows that match the type
  */
  allOfType (Constructor) {
    return this.all().filter((w) => w instanceof Constructor)
  }

  /**
  * @param Constructor: the type to fetch
  * @return the first window that satisfies the matched type
  */
  getOfType (Constructor) {
    return this.all().find((w) => w instanceof Constructor)
  }

  /* ****************************************************************************/
  // Getters: WebContents
  /* ****************************************************************************/

  /**
  * @param wcId: the webcontents id
  * @return the wavebox window
  */
  fromWebContentsId (wcId) {
    return Array.from(this[privAttached].values())
      .find((w) => w.window.webContents.id === wcId)
  }

  /* ****************************************************************************/
  // Getters: Tabs
  /* ****************************************************************************/

  /**
  * @return a list of tab ids
  */
  allTabIds () {
    return this.all().reduce((acc, waveboxWindow) => {
      return acc.concat(waveboxWindow.tabIds())
    }, [])
  }

  /**
  * @param tabId: the id of the tab
  * @return the wavebox window that relates to the tab or undefined
  */
  fromTabId (tabId) {
    const wc = webContents.fromId(tabId)
    if (!wc) { return undefined }
    const bw = BrowserWindow.fromWebContents(wc.hostWebContents || wc)
    if (!bw) { return undefined }
    return this[privAttached].get(bw.id)
  }

  /* ****************************************************************************/
  // Getters: Browser window ids
  /* ****************************************************************************/

  /**
  * @return all the attached browser window ids
  */
  allBrowserWindowIds () { return Array.from(this[privAttachedIndex]) }

  /**
  * @param bwId: the id of the browser window
  * @return the window reference or undefined
  */
  fromBrowserWindowId (bwId) { return this[privAttached].get(bwId) }

  /**
  * @param bw: the browser window
  * @return the window reference or undefined
  */
  fromBrowserWindow (bw) { return bw ? this.fromBrowserWindowId(bw.id) : undefined }

  /* ****************************************************************************/
  // Getters: Focused
  /* ****************************************************************************/

  /**
  * @return the window that was in focus last or is in focus now
  */
  lastFocused () {
    const all = this.all()
    let last
    for (let i = 0; i < all.length; i++) {
      if (all[i].isFocused()) { return all[i] }
      if (!last || all[i].lastTimeInFocus > last.lastTimeInFocus) {
        last = all[i]
      }
    }
    return last
  }

  /**
  * @return the focused window or undefined
  */
  focused () {
    return this.all().find((w) => w.isFocused())
  }

  /**
  * @return the id of the window that was in focus last
  */
  lastFocusedId () {
    const last = this.lastFocused()
    return last ? last.browserWindowId : undefined
  }

  /**
  * @return the id of the tab that's in focus in the focused window
  */
  focusedTabId () {
    const focusedWindow = this.lastFocused()
    if (!focusedWindow) { return undefined }
    return focusedWindow.focusedTabId()
  }

  /* ****************************************************************************/
  // Cycling
  /* ****************************************************************************/

  /**
  * Cycles to the next window
  * @return the browserWindowId of the next window or undefined if none were found
  */
  cycleNextWindow () {
    const lastId = this.lastFocusedId()
    if (lastId !== undefined) {
      const lastIndex = this[privAttachedIndex].indexOf(lastId)
      if (lastIndex !== -1) {
        const nextIndex = lastIndex >= this[privAttachedIndex].length - 1 ? 0 : lastIndex + 1
        const nextId = this[privAttachedIndex][nextIndex]
        const next = this[privAttached].get(nextId)
        if (next) {
          next.focus()
          return next.browserWindowId
        }
      }
    }

    if (this[privAttachedIndex][0] !== undefined) {
      const next = this[privAttached].get(this[privAttachedIndex][0])
      if (next) {
        next.focus()
        return next.browserWindowId
      }
    }

    return undefined
  }
}

export default WaveboxWindowManager
