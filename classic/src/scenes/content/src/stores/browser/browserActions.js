import alt from '../alt'
import {
  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class BrowserActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param initialUrl: the initial url
  */
  load (initialUrl) { return { initialUrl } }

  /* **************************************************************************/
  // Display
  /* **************************************************************************/

  /**
  * Sets the current page title
  * @param title: the title to set
  */
  setPageTitle (title) { return { title: title } }

  /**
  * Sets the current page target url
  * @param url: the url
  */
  setTargetUrl (url) { return { url: url } }

  /**
  * Sets the current url of the page
  * @param url: the url
  */
  setCurrentUrl (url) { return { url: url } }

  /**
  * Indicates the page started loading
  */
  startLoading () { return {} }

  /**
  * Indicates the page stopped loading
  */
  stopLoading () { return {} }

  /**
  * Updates the navigation controls
  * @param canGoBack: true if the browser can go back
  * @param canGoForward: true if the browser can go forward
  */
  updateNavigationControls (canGoBack, canGoForward) {
    return { canGoBack: canGoBack, canGoForward: canGoForward }
  }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching
  */
  startSearch () { return {} }

  /**
  * Toggles search on and off
  */
  toggleSearch () { return {} }

  /**
  * Stops searching
  */
  stopSearch () { return {} }

  /**
  * Sets the search string
  * @param str: the string to search for
  */
  setSearch (str) { return { str: str } }

  /**
  * Searches for the next occurance
  */
  searchNext () { return {} }
}

const actions = alt.createActions(BrowserActions)
ipcRenderer.on(WB_WINDOW_FIND_START, (evt) => actions.startSearch())
ipcRenderer.on(WB_WINDOW_FIND_NEXT, (evt) => actions.searchNext())
export default actions
