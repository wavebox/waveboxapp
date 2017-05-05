import alt from '../alt'
import actions from './browserActions'
import querystring from 'querystring'

class BrowserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.pageTitle = 'Wavebox'
    this.targetUrl = null
    this.currentUrl = querystring.parse(window.location.search.slice(1)).url
    this.isLoading = true
    this.canGoBack = false
    this.canGoForward = false

    this.isSearching = false
    this.searchTerm = ''
    this.searchNextHash = 0

    this.zoomFactor = 0.0

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
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
      handleSearchNext: actions.SEARCH_NEXT,

      handleIncreaseZoom: actions.INCREASE_ZOOM,
      handleDecreaseZoom: actions.DECREASE_ZOOM,
      handleResetZoom: actions.RESET_ZOOM
    })
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

  /* **************************************************************************/
  // Handlers: Zoom
  /* **************************************************************************/

  handleIncreaseZoom () {
    this.zoomFactor = Math.min(1.5, this.zoomFactor + 0.1)
  }

  handleDecreaseZoom () {
    this.zoomFactor = Math.max(-1.5, this.zoomFactor - 0.1)
  }

  handleResetZoom () {
    this.zoomFactor = 1.0
  }
}

export default alt.createStore(BrowserStore, 'BrowserStore')
