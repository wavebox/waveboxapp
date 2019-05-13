import { evtMain } from 'AppEvents'
import { webContents } from 'electron'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import ConnectedTab from './ConnectedTab'

const privConnected = Symbol('privConnected')

class RecentTrackerService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Map()

    evtMain.on(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    evtMain.on(evtMain.WB_TAB_ACTIVATED, this.handleTabActivated)
    evtMain.on(evtMain.WB_WINDOW_FOCUSED, this.handleWindowFocused)
  }

  /* ****************************************************************************/
  // Events: Tabs
  /* ****************************************************************************/

  /**
  * Handles a tab being created
  * @param evt: the event that fired
  * @param wcId: the id of the web contents
  */
  handleTabCreated = (evt, wcId) => {
    if (this[privConnected].has(wcId)) { return }
    const tabMeta = evt.sender.tabMetaInfo(wcId)
    if (!tabMeta || tabMeta.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return }

    const wc = webContents.fromId(wcId)
    if (!wc || wc.isDestroyed()) { return }

    wc.on('destroyed', () => { this[privConnected].delete(wcId) })
    wc.on('did-start-navigation', this.handleTabStartNavigation)
    wc.on('page-favicon-updated', this.handleTabFaviconUpdated)
    wc.on('page-title-updated', this.handleTabTitleUpdated)

    const connection = new ConnectedTab(wcId, evt.sender.windowType, tabMeta.serviceId)
    connection.startNavigation(wc.getURL(), wc.getTitle())
    this[privConnected].set(wcId, connection)
  }

  /**
  * Handles a tab being activated
  * @param evt: the event that fired
  * @param bwId: the id of the browser window
  * @param wcId: the id of the webcontents
  */
  handleTabActivated = (evt, bwId, wcId) => {
    const connection = this[privConnected].get(wcId)
    if (!connection) { return }
    connection.focus()
  }

  /**
  * Handles a window being activated
  * @param evt: the event that fired
  * @param bwId: the id of the browser window
  */
  handleWindowFocused = (evt, bwId) => {
    const win = WaveboxWindow.fromBrowserWindowId(bwId)
    if (!win) { return }
    this.handleTabActivated(evt, bwId, win.focusedTabId())
  }

  /* ****************************************************************************/
  // Events: webContents
  /* ****************************************************************************/

  /**
  * Handles a tab starting navigation
  * @param evt: the event that fired
  * @param url: the url that fired
  * @param isInPlace: true if navigation is in place
  * @param isMainFrame: true if navigation is in the main frame
  */
  handleTabStartNavigation = (evt, url, isInPlace, isMainFrame) => {
    if (!isMainFrame) { return }
    const connection = this[privConnected].get(evt.sender.id)
    if (!connection) { return }

    if (isInPlace) {
      connection.startInPageNavigation(url, evt.sender.getTitle())
    } else {
      connection.startNavigation(url, evt.sender.getTitle())
    }
  }

  /**
  * Handles a tab updating the favicon
  * @param evt: the event that fired
  * @param favicons: the favicons that were set
  */
  handleTabFaviconUpdated = (evt, favicons) => {
    const connection = this[privConnected].get(evt.sender.id)
    if (!connection) { return }

    Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 1000)
          evt.sender.executeJavaScript(`
            (function () {
              try {
                return Array.from(document.head.querySelectorAll('link[rel="apple-touch-icon"]')).map((e) => e.href).filter((v) => !!v)
              } catch (ex) {
                return []
              }
            })()
          `, (touchIcons) => {
            clearTimeout(timeout)
            resolve(touchIcons)
          })
        })
      })
      .catch((ex) => Promise.resolve([]))
      .then((touchIcons) => {
        connection.setFavicons([].concat(favicons, touchIcons))
      })
  }

  /**
  * Handles a tab updating the title
  * @param evt: the event that fired
  * @param title: the title that was set
  */
  handleTabTitleUpdated = (evt, title) => {
    const connection = this[privConnected].get(evt.sender.id)
    if (!connection) { return }
    connection.setTitle(title)
  }
}

export default RecentTrackerService
