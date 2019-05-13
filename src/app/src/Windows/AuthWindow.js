import WaveboxWindow from './WaveboxWindow'
import { GuestWebPreferences } from 'WebContentsManager'
import { evtMain } from 'AppEvents'

class AuthWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.AUTH }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  create (url, browserWindowPreferences = {}) {
    if (!browserWindowPreferences.webPreferences) {
      browserWindowPreferences.webPreferences = {}
    }
    GuestWebPreferences.sanitizeForGuestUse(browserWindowPreferences.webPreferences)

    super.create(url, browserWindowPreferences)

    // Setup for tab lifecycle
    const webContentsId = this.window.webContents.id
    this.emit('tab-created', { sender: this }, webContentsId)
    evtMain.emit(evtMain.WB_TAB_CREATED, { sender: this }, webContentsId)
    this.window.webContents.once('destroyed', () => {
      this.emit('tab-destroyed', { sender: this }, webContentsId)
      evtMain.emit(evtMain.WB_TAB_DESTROYED, { sender: this }, webContentsId)
    })

    this.showNativeUI()

    return this
  }

  /* ****************************************************************************/
  // Overwritable behaviour
  /* ****************************************************************************/

  /**
  * Checks if the webcontents is allowed to navigate to the next url. If false is returned
  * it will be prevented
  * @param evt: the event that fired
  * @param browserWindow: the browserWindow that's being checked
  * @param nextUrl: the next url to navigate
  * @return false to suppress, true to allow
  */
  allowNavigate (evt, browserWindow, nextUrl) {
    return true
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused tab
  */
  focusedTabId () {
    return this.window.webContents.id
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return [this.window.webContents.id]
  }

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    return undefined
  }

  /**
  * @return the webcontents which is an editable target
  */
  focusedEditableWebContents () {
    return this.window.webContents
  }
}

export default AuthWindow
