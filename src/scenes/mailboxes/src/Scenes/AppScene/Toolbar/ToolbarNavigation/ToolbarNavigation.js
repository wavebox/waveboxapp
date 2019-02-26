import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import { remote } from 'electron'
import BrowserToolbarContent from 'wbui/BrowserToolbarContent'

class ToolbarNavigation extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired,
    tabId: PropTypes.number,
    mailboxId: PropTypes.string,
    serviceId: PropTypes.string
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.bindWebContentsListeners(this.props.tabId)
  }

  componentWillUnmount () {
    this.unbindWebContentsListeners(this.props.tabId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.tabId !== nextProps.tabId) {
      this.unbindWebContentsListeners(this.props.tabId)
      this.bindWebContentsListeners(nextProps.tabId)
      this.setState(this.generateFreshState(nextProps.tabId))
    }
  }

  /* **************************************************************************/
  // Binding
  /* **************************************************************************/

  /**
  * Binds the listeners to the web contents
  * @param tabId: the id of the tab to bind the listeners to
  */
  bindWebContentsListeners (tabId) {
    if (tabId === undefined) { return }

    const webContents = remote.webContents.fromId(tabId)
    if (!webContents) { return }

    webContents.on('did-start-navigation', this.handleDidStartNavigation)
    webContents.on('did-start-loading', this.handleDidStartLoading)
    webContents.on('did-stop-loading', this.handleDidStopLoading)
    webContents.on('did-navigate-in-page', this.handleDidNavigateInPage)
    webContents.on('did-navigate', this.handleDidNavigate)
  }

  /**
  * Unbinds the listeners from the web contents
  * @param tabId: the id of the tab to remove the bind from
  */
  unbindWebContentsListeners (tabId) {
    if (tabId === undefined) { return }

    const webContents = remote.webContents.fromId(tabId)
    if (!webContents) { return }

    webContents.removeListener('did-start-navigation', this.handleDidStartNavigation)
    webContents.removeListener('did-start-loading', this.handleDidStartLoading)
    webContents.removeListener('did-stop-loading', this.handleDidStopLoading)
    webContents.removeListener('did-navigate-in-page', this.handleDidNavigateInPage)
    webContents.removeListener('did-navigate', this.handleDidNavigate)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateFreshState(this.props.tabId)
    }
  })()

  /**
  * Generates a blank state
  * @param tabId: the id of the tab
  * @return the generated state
  */
  generateFreshState (tabId) {
    if (tabId) {
      const webContents = remote.webContents.fromId(tabId)
      if (webContents) {
        return {
          isLoading: webContents.isLoading(),
          currentUrl: webContents.getURL(),
          canGoBack: webContents.canGoBack(),
          canGoForward: webContents.canGoForward()
        }
      }
    }

    return {
      isLoading: false,
      currentUrl: '',
      canGoBack: false,
      canGoForward: false
    }
  }

  /* **************************************************************************/
  // WebContents events
  /* **************************************************************************/

  /**
  * Handles a browser preparing to navigate
  * @param evt: the event that fired
  * @param url: the url
  */
  handleDidStartNavigation = (evt, url, isInPlace, isMainFrame) => {
    if (!isMainFrame) { return }
    this.setState({
      currentUrl: evt.sender.getURL(), // Don't use the passed url - the nav might be cancelled
      canGoBack: evt.sender.canGoBack(),
      canGoForward: evt.sender.canGoForward()
    })
  }

  /**
  * Handles the browser starting to load
  * @param evt: the event that fired
  */
  handleDidStartLoading = (evt) => {
    this.setState({ isLoading: true })
  }

  /**
  * Handles the browser finishing to load
  * @param evt: the event that fired
  */
  handleDidStopLoading = (evt) => {
    this.setState({ isLoading: false })
  }

  /**
  * Handles the browser navigating in the page
  * @param evt: the event that fired
  * @param url: the url
  * @param isMainFrame: true if this is the main frame
  */
  handleDidNavigateInPage = (evt, url, isMainFrame) => {
    if (isMainFrame) {
      this.setState({
        currentUrl: url,
        canGoBack: evt.sender.canGoBack(),
        canGoForward: evt.sender.canGoForward()
      })
    }
  }

  /**
  * Handles the browser finishing navigate
  * @param evt: the event that fired
  * @param url: the url
  */
  handleDidNavigate = (evt, url) => {
    this.setState({
      currentUrl: url,
      canGoBack: evt.sender.canGoBack(),
      canGoForward: evt.sender.canGoForward()
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Navigates home
  */
  handleGoHome = () => {
    const { tabId, serviceId } = this.props
    if (tabId === undefined) { return }

    const accountState = accountStore.getState()
    const service = accountState.getService(serviceId)
    if (!service) { return }
    const webContents = remote.webContents.fromId(tabId)
    if (!webContents) { return }

    webContents.loadURL(service.url)
  }

  /**
  * Navigates back
  */
  handleGoBack = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.goBack()
  }

  /**
  * Navigates forward
  */
  handleGoForward = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.goForward()
  }

  /**
  * Stops navigation
  */
  handleStop = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.stop()
  }

  /**
  * Reloads current page
  */
  handleReload = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.reload()
  }

  /**
  * Handles the address field leaving focus
  */
  handleBlurAddress = () => {
    if (window.location.hash.indexOf('keyboardtarget?browserurl=true') !== -1) {
      window.location.hash = '/'
    }
  }

  /**
  * Handles the address field going into focus
  */
  handleFocusAddress = () => {
    window.location.hash = '/keyboardtarget?browserurl=true'
  }

  /**
  * Changes the address
  * @param evt: the event that fired
  * @param url: the url to open
  */
  handleChangeAddress = (evt, url) => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.loadURL(url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      toolbarHeight,
      tabId,
      mailboxId,
      serviceId,
      ...passProps
    } = this.props
    const {
      isLoading,
      currentUrl,
      canGoBack,
      canGoForward
    } = this.state

    return (
      <BrowserToolbarContent
        address={currentUrl}
        isLoading={isLoading}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        hasGoBack
        hasGoForward
        hasStopAndReload
        hasLoadingSpinner
        hasHome
        hasDownload={false}
        hasSearch={false}
        hasOpenInBrowser={false}
        onGoBack={this.handleGoBack}
        onGoForward={this.handleGoForward}
        onStop={this.handleStop}
        onReload={this.handleReload}
        onHome={this.handleGoHome}
        onBlurAddress={this.handleBlurAddress}
        onFocusAddress={this.handleFocusAddress}
        onChangeAddress={this.handleChangeAddress}
        {...passProps} />
    )
  }
}

export default ToolbarNavigation
