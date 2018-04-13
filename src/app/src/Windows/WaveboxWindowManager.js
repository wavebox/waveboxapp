import { BrowserWindow, webContents } from 'electron'

const privAttachedCycleIndex = Symbol('privAttachedCycleIndex')
const privAttached = Symbol('privAttached')
const privAttachedSpecial = Symbol('privAttachedSpecial')
const privAttachedSpecialMeta = Symbol('privAttachedSpecialMeta')

class WaveboxWindowManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privAttached] = new Map()

    this[privAttachedSpecial] = new Set()
    this[privAttachedSpecialMeta] = new Map()

    this[privAttachedCycleIndex] = []
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
    if (this[privAttachedSpecial].has(waveboxWindow.browserWindowId)) { return }
    this[privAttached].set(waveboxWindow.browserWindowId, waveboxWindow)
    this[privAttachedCycleIndex].push(waveboxWindow.browserWindowId)
  }

  /**
  * Attaches a special window, that isn't a proper WaveboxWindow
  * @param browserWindowId: the browserWindow id. Only weak ref is held
  */
  attachSpecial (browserWindowId) {
    if (this[privAttached].has(browserWindowId)) { return }
    if (this[privAttachedSpecial].has(browserWindowId)) { return }
    const bw = BrowserWindow.fromId(browserWindowId)
    if (!bw || bw.isDestroyed()) { return }

    // Bind some tracking events into the window
    const meta = {
      bindings: {
        closed: this._handleSpecialClosed.bind(this, browserWindowId),
        focus: this._handleSpecialFocused.bind(this, browserWindowId)
      },
      browserWindowId: browserWindowId,
      lastTimeInFocus: bw.isFocused() ? new Date().getTime() : 0
    }
    bw.on('closed', meta.bindings.closed)
    bw.on('focus', meta.bindings.focus)

    // Keep a record
    this[privAttachedSpecial].add(browserWindowId)
    this[privAttachedSpecialMeta].set(browserWindowId, meta)
    this[privAttachedCycleIndex].push(browserWindowId)
  }

  /**
  * Detaches a wavebox window
  * @param waveboxWindow: the window that detached
  */
  detach (waveboxWindow) {
    if (!this[privAttached].has(waveboxWindow.browserWindowId)) { return }
    this[privAttached].delete(waveboxWindow.browserWindowId)

    const index = this[privAttachedCycleIndex].indexOf(waveboxWindow.browserWindowId)
    this[privAttachedCycleIndex].splice(index, 1)
  }

  /**
  * Detaches a special window, that isn't a proper WaveboxWindow
  * @param browserWindowId: the browserWindow id. Only weak ref is held
  */
  detachSpecial (browserWindowId) {
    if (!this[privAttachedSpecial].has(browserWindowId)) { return }

    // Remove our tracking events
    const bw = BrowserWindow.fromId(browserWindowId)
    if (bw && !bw.isDestroyed()) {
      const meta = this[privAttachedSpecialMeta].get(browserWindowId)
      bw.removeListener('closed', meta.bindings.closed)
      bw.removeListener('focus', meta.bindings.focus)
    }

    // Remove our records
    const index = this[privAttachedCycleIndex].indexOf(browserWindowId)
    this[privAttachedCycleIndex].splice(index, 1)
    this[privAttachedSpecial].delete(browserWindowId)
    this[privAttachedSpecialMeta].delete(browserWindowId)
  }

  /* ****************************************************************************/
  // Special
  /* ****************************************************************************/

  /**
  * Handles a special window closing by auto detaching
  * @param browserWindowId: the id of the browser window
  */
  _handleSpecialClosed = (browserWindowId) => {
    this.detachSpecial(browserWindowId)
  }

  /**
  * Handles a speical window coming into focus by recording it
  * @param browserWindowId: the id of the browser window
  */
  _handleSpecialFocused = (browserWindowId) => {
    const meta = this[privAttachedSpecialMeta].get(browserWindowId)
    meta.lastTimeInFocus = new Date().getTime()
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

  /**
  * @param tabId: the id of the tab
  * @return the meta info for the tab
  */
  tabMetaInfo (tabId) {
    const w = this.fromTabId(tabId)
    return w ? w.tabMetaInfo(tabId) : undefined
  }

  /* ****************************************************************************/
  // Getters: Browser window ids
  /* ****************************************************************************/

  /**
  * @return all the attached browser window ids
  */
  allBrowserWindowIds () { return Array.from(this[privAttached].keys()) }

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
  * @param includeSpecial=false: true to also include special windows in the search
  * @return the id of the window that was in focus last
  */
  lastFocusedId (includeSpecial = false) {
    const last = this.lastFocused()
    if (includeSpecial) {
      if (last && last.isFocused()) { return last.browserWindowId }
      const lastIncludingSpecial = Array.from(this[privAttachedSpecialMeta].values()).reduce((acc, meta) => {
        if (!last) { return meta }
        if (meta.lastTimeInFocus > last.lastTimeInFocus) { return meta }
        return last
      }, last)
      return lastIncludingSpecial ? lastIncludingSpecial.browserWindowId : undefined
    } else {
      return last ? last.browserWindowId : undefined
    }
  }

  /**
  * @return the focused window or undefined
  */
  focused () {
    return this.all().find((w) => w.isFocused())
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
    // We have to be careful here because we have some properly attached windows
    // and some that are special attached windows. The special ones don't contain
    // as must info about last focused etc

    // Figure out who is in focus/who was in focus last
    let currentIndex
    let currentIndexLastTimeInFocus = 0
    for (let i = 0; i < this[privAttachedCycleIndex].length; i++) {
      const browserWindowId = this[privAttachedCycleIndex][i]
      const bw = BrowserWindow.fromId(browserWindowId)
      if (!bw || bw.isDestroyed()) { continue }
      if (!bw.isVisible()) { continue }
      if (bw.isFocused()) {
        currentIndex = i
        break
      }

      let lastTimeInFocus
      if (this[privAttached].has(browserWindowId)) {
        lastTimeInFocus = this[privAttached].get(browserWindowId).lastTimeInFocus
      } else if (this[privAttachedSpecial].has(browserWindowId)) {
        lastTimeInFocus = this[privAttachedSpecialMeta].get(browserWindowId).lastTimeInFocus
      } else {
        lastTimeInFocus = -1
      }

      if (lastTimeInFocus > currentIndexLastTimeInFocus) {
        currentIndex = i
        currentIndexLastTimeInFocus = lastTimeInFocus
      }
    }

    // Figure out who is in focus next
    if (currentIndex !== undefined) {
      const shiftedCycle = [].concat(
        this[privAttachedCycleIndex].slice(currentIndex + 1),
        this[privAttachedCycleIndex].slice(0, currentIndex + 1)
      )

      for (let i = 0; i < shiftedCycle.length; i++) {
        const browserWindowId = shiftedCycle[i]
        const bw = BrowserWindow.fromId(browserWindowId)
        if (!bw || bw.isDestroyed()) { continue }
        if (!bw.isVisible()) { continue }

        bw.focus()
        return bw.id
      }
    }

    return undefined
  }
}

export default WaveboxWindowManager
