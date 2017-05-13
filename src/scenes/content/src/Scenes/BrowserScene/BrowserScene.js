import PropTypes from 'prop-types'
import './BrowserScene.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import BrowserView from 'sharedui/Components/BrowserView'
import BrowserTargetUrl from './BrowserTargetUrl'
import BrowserSearch from './BrowserSearch'
import BrowserToolbar from './BrowserToolbar'
import { browserActions, browserStore } from 'stores/browser'

const { ipcRenderer, remote: { shell } } = window.nativeRequire('electron')

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
    ipcRenderer.on('reload-webview', this.handleIPCReload)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
    ipcRenderer.removeListener('reload-webview', this.handleIPCReload)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const browserState = browserStore.getState()
    return {
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm,
      searchNextHash: browserState.searchNextHash,
      zoomFactor: browserState.zoomFactor
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm,
      searchNextHash: browserState.searchNextHash,
      zoomFactor: browserState.zoomFactor
    })
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  handleIPCReload = () => {
    this.refs[BROWSER_REF].reload()
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
    switch (evt.channel.type) {
      case 'pong-resource-usage': ipcRenderer.send('pong-resource-usage', evt.channel.data); break
      default: break
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { url, partition } = this.props
    const { zoomFactor, isSearching, searchTerm, searchNextHash } = this.state

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
            className='ReactComponent-BrowserSceneWebView'
            preload='../platform/webviewInjection/contentTooling'
            zoomFactor={zoomFactor}
            searchTerm={isSearching ? searchTerm : undefined}
            searchId={searchNextHash}
            updateTargetUrl={(evt) => browserActions.setTargetUrl(evt.url)}
            pageTitleUpdated={(evt) => browserActions.setPageTitle(evt.title)}
            didStartLoading={(evt) => browserActions.startLoading()}
            didStopLoading={(evt) => browserActions.stopLoading()}
            newWindow={(evt) => shell.openExternal(evt.url, { })}
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
