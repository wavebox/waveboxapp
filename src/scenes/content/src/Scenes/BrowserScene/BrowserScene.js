import PropTypes from 'prop-types'
import './BrowserScene.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WebView from 'sharedui/Components/WebView'
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    // Push the search events down into the webview by diffing the state
    // change
    const { isSearching, searchTerm, searchNextHash } = this.state

    if (isSearching) {
      if (isSearching !== prevState.isSearching) { this.refs[SEARCH_REF].focus() }
      if (searchTerm !== prevState.searchTerm) {
        if (searchTerm && searchTerm.length) {
          this.refs[BROWSER_REF].findInPage(searchTerm)
        } else {
          this.refs[BROWSER_REF].stopFindInPage('clearSelection')
        }
      }
      if (searchNextHash !== prevState.searchNextHash) {
        if (searchTerm && searchTerm.length) {
          this.refs[BROWSER_REF].findInPage(searchTerm, { findNext: true })
        }
      }
    } else {
      if (isSearching !== prevState.isSearching) {
        this.refs[BROWSER_REF].stopFindInPage('clearSelection')
      }
    }
  }

  render () {
    const { url, partition } = this.props

    return (
      <div className='ReactComponent-BrowserScene'>
        <BrowserToolbar
          handleGoBack={() => this.refs[BROWSER_REF].goBack()}
          handleGoForward={() => this.refs[BROWSER_REF].goForward()}
          handleStop={() => this.refs[BROWSER_REF].stop()}
          handleReload={() => this.refs[BROWSER_REF].reload()} />
        <div className='ReactComponent-BrowserSceneWebViewContainer'>
          <WebView
            ref={BROWSER_REF}
            src={url}
            className='ReactComponent-BrowserSceneWebView'
            preload='../platform/webviewInjection/contentTooling'
            partition={partition}
            updateTargetUrl={(evt) => browserActions.setTargetUrl(evt.url)}
            pageTitleUpdated={(evt) => browserActions.setPageTitle(evt.title)}
            didStartLoading={(evt) => browserActions.startLoading()}
            didStopLoading={(evt) => browserActions.stopLoading()}
            newWindow={(evt) => shell.openExternal(evt.url, { })}
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
