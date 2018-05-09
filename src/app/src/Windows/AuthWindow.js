import WaveboxWindow from './WaveboxWindow'
import { GuestWebPreferences } from 'WebContentsManager'

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

    return super.create(url, browserWindowPreferences)
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
  // Info
  /* ****************************************************************************/

  focusedTabId () { return null }
  tabIds () { return [] }
  tabMetaInfo (tabId) { return undefined }
}

export default AuthWindow
