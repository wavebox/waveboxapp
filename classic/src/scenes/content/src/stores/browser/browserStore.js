import alt from '../alt'
import actions from './browserActions'

class BrowserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.pageTitle = 'Wavebox'
    this.targetUrl = null
    this.currentUrl = ''
    this.isLoading = true
    this.canGoBack = false
    this.canGoForward = false

    this.isSearching = false
    this.searchTerm = ''
    this.searchNextHash = 0

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleLoad: actions.LOAD,

      handleSetPageTitle: actions.SET_PAGE_TITLE,
      handleSetTargetUrl: actions.SET_TARGET_URL,
      handleSetCurrentUrl: actions.SET_CURRENT_URL,
      handleStartLoading: actions.START_LOADING,
      handleStopLoading: actions.STOP_LOADING,
      handleUpdateNavigationControls: actions.UPDATE_NAVIGATION_CONTROLS,

      handleStartSearch: actions.START_SEARCH,
      handleStopSearch: actions.STOP_SEARCH,
      handleToggleSearch: actions.TOGGLE_SEARCH,
      handleSetSearch: actions.SET_SEARCH,
      handleSearchNext: actions.SEARCH_NEXT
    })
  }

  /* **************************************************************************/
  // Handlers: Load
  /* **************************************************************************/

  handleLoad ({ initialUrl }) {
    this.currentUrl = initialUrl
  }

  /* **************************************************************************/
  // Handlers: Display
  /* **************************************************************************/

  handleSetPageTitle ({ title }) {
    this.pageTitle = title
    document.title = title
  }

  handleSetTargetUrl ({ url }) {
    this.targetUrl = url === '' ? null : url
  }

  handleSetCurrentUrl ({ url }) {
    this.currentUrl = url
  }

  handleStartLoading () {
    this.isLoading = true
  }

  handleStopLoading () {
    this.isLoading = false
  }

  handleUpdateNavigationControls ({ canGoBack, canGoForward }) {
    if (this.canGoBack === canGoBack && this.canGoForward === canGoForward) {
      this.preventDefault()
      return
    }
    this.canGoBack = canGoBack
    this.canGoForward = canGoForward
  }

  /* **************************************************************************/
  // Handlers: Search
  /* **************************************************************************/

  handleStartSearch () {
    this.isSearching = true
  }

  handleStopSearch () {
    this.isSearching = false
    this.searchTerm = ''
  }

  handleToggleSearch () {
    if (this.isSearching) {
      this.handleStopSearch()
    } else {
      this.handleStartSearch()
    }
  }

  handleSetSearch ({ str }) {
    this.searchTerm = str
  }

  handleSearchNext () {
    this.searchNextHash = new Date().getTime()
  }
}

export default alt.createStore(BrowserStore, 'BrowserStore')
