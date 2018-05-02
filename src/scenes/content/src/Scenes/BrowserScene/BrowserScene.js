import PropTypes from 'prop-types'
import './BrowserScene.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import BrowserView from 'sharedui/Components/BrowserView'
import BrowserTargetUrl from './BrowserTargetUrl'
import BrowserSearch from './BrowserSearch'
import BrowserToolbar from './BrowserToolbar'
import { browserActions, browserStore } from 'stores/browser'
import MouseNavigationDarwin from 'sharedui/Navigators/MouseNavigationDarwin'
import Resolver from 'Runtime/Resolver'
import { remote } from 'electron'

const SEARCH_REF = 'search'
const BROWSER_REF = 'browser'

export default class BrowserScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string.isRequired,
    partition: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
    if (process.platform === 'darwin') {
      this.mouseNavigator = new MouseNavigationDarwin(
        () => this.refs[BROWSER_REF].goBack(),
        () => this.refs[BROWSER_REF].goForward()
      )
      this.mouseNavigator.register()
    }

    // Handle a case where the webview wont immediately take focus.
    // Hack around a little bit to get it to focus
    setTimeout(() => { this.focusWebView() }, 1)
    remote.getCurrentWindow().on('focus', this.focusWebView)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
    if (process.platform === 'darwin') {
      this.mouseNavigator.unregister()
    }
    remote.getCurrentWindow().removeListener('focus', this.focusWebView)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const browserState = browserStore.getState()
    return {
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm,
      searchNextHash: browserState.searchNextHash
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm,
      searchNextHash: browserState.searchNextHash
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the navigation state changing
  * @param evt: an event which includes a url prop
  */
  navigationStateDidChange = (evt) => {
    if (evt.url) {
      browserActions.setCurrentUrl(evt.url)
    }
    browserActions.updateNavigationControls(
      this.refs[BROWSER_REF].canGoBack(),
      this.refs[BROWSER_REF].canGoForward()
    )
  }

  /**
  * Handles IPC Messages from the browser
  * @param evt: the event that fired
  */
  handleBrowserIPCMessage = (evt) => {

  }

  /**
  * Handles closing the guest requesting the ipc window closure
  * @param evt: the event that fired
  */
  handleClose = (evt) => {
    remote.getCurrentWindow().close()
  }

  /* **************************************************************************/
  // UI Tools
  /* **************************************************************************/

  // (Thomas101)We shouldn't use dom manipulation, but for this simple window
  // it's overkill for anything - consider removing this in the future when
  // this gets more complex.
  // There's some weird behaviour whereby passing dom.focus() doesn't always
  // focus the element, yet when that fails wc.focus() will
  // Fixes https://github.com/wavebox/waveboxapp/issues/660
  focusWebView = () => {
    this.refs[BROWSER_REF].focus()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { url, partition } = this.props
    const { isSearching, searchTerm, searchNextHash } = this.state

    const preloadScripts = [
      Resolver.guestPreload(),
      Resolver.crExtensionApiPreload()
    ].join('_wavebox_preload_split_')

    // The partition should be set on the will-attach-webview in the main thread
    // but this doesn't have the desired effect. Set it here for good-stead
    return (
      <div className='ReactComponent-BrowserScene'>
        <BrowserToolbar
          handleGoBack={() => this.refs[BROWSER_REF].goBack()}
          handleGoForward={() => this.refs[BROWSER_REF].goForward()}
          handleStop={() => this.refs[BROWSER_REF].stop()}
          handleReload={() => this.refs[BROWSER_REF].reload()} />
        <div className='ReactComponent-BrowserSceneWebViewContainer'>
          <BrowserView
            ref={BROWSER_REF}
            src={url}
            partition={partition}
            plugins
            allowpopups
            className='ReactComponent-BrowserSceneWebView'
            webpreferences='contextIsolation=yes, nativeWindowOpen=yes, sharedSiteInstances=yes, sandbox=yes'
            preload={preloadScripts}
            searchTerm={isSearching ? searchTerm : undefined}
            searchId={searchNextHash}
            close={this.handleClose}
            updateTargetUrl={(evt) => browserActions.setTargetUrl(evt.url)}
            pageTitleUpdated={(evt) => browserActions.setPageTitle(evt.title)}
            didStartLoading={(evt) => browserActions.startLoading()}
            didStopLoading={(evt) => browserActions.stopLoading()}
            ipcMessage={this.handleBrowserIPCMessage}
            willNavigate={this.navigationStateDidChange}
            didNavigate={this.navigationStateDidChange}
            didNavigateInPage={(evt) => {
              if (evt.isMainFrame) { this.navigationStateDidChange(evt) }
            }} />
        </div>
        <BrowserTargetUrl />
        <BrowserSearch ref={SEARCH_REF} />
      </div>
    )
  }
}
