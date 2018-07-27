import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import BrowserView from 'wbui/Guest/BrowserView'
import BrowserSearch from './BrowserSearch'
import BrowserToolbar from './BrowserToolbar'
import { browserActions, browserStore } from 'stores/browser'
import { settingsStore } from 'stores/settings'
import MouseNavigationDarwin from 'wbui/MouseNavigationDarwin'
import Resolver from 'Runtime/Resolver'
import { remote } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import BrowserViewLoadBar from 'wbui/Guest/BrowserViewLoadBar'
import BrowserViewTargetUrl from 'wbui/Guest/BrowserViewTargetUrl'
import BrowserViewPermissionRequests from 'wbui/Guest/BrowserViewPermissionRequests'

const SEARCH_REF = 'search'
const BROWSER_REF = 'browser'

const styles = {
  scene: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  webviewContainer: {
    position: 'absolute',
    top: 40,
    bottom: 0,
    left: 0,
    right: 0
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 40
  }
}

@withStyles(styles)
class BrowserScene extends React.Component {
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
    if (process.platform === 'darwin' && settingsStore.getState().launched.app.enableMouseNavigationDarwin) {
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
      searchNextHash: browserState.searchNextHash,
      targetUrl: browserState.targetUrl,
      isLoading: browserState.isLoading,
      permissionRequests: [],
      permissionRequestsUrl: undefined
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm,
      searchNextHash: browserState.searchNextHash,
      targetUrl: browserState.targetUrl,
      isLoading: browserState.isLoading
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
  * Handles the permission requests changing
  * @param evt: the event that fired
  */
  handlePermissionRequestsChanged = (evt) => {
    this.setState({
      permissionRequests: evt.pending,
      permissionRequestsUrl: evt.url
    })
  }

  /**
  * Handles closing the guest requesting the ipc window closure
  * @param evt: the event that fired
  */
  handleClose = (evt) => {
    remote.getCurrentWindow().close()
  }

  /**
  * Handles a permission being resolved
  * @param type: the permission type
  * @param permission: the resolved permission
  */
  handleResolvePermission = (type, permission) => {
    if (this.refs[BROWSER_REF]) {
      this.refs[BROWSER_REF].resolvePermissionRequest(type, permission)
    }
  }

  /* **************************************************************************/
  // UI Tools
  /* **************************************************************************/

  /**
  * Pulls the webview into focus
  */
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
    const {
      url,
      partition,
      classes
    } = this.props
    const {
      isSearching,
      searchTerm,
      targetUrl,
      isLoading,
      searchNextHash,
      permissionRequests,
      permissionRequestsUrl
    } = this.state

    const preloadScripts = [
      Resolver.guestPreload(),
      Resolver.crExtensionApiPreload()
    ].join('_wavebox_preload_split_')

    // The partition should be set on the will-attach-webview in the main thread
    // but this doesn't have the desired effect. Set it here for good-stead
    return (
      <div className={classes.scene}>
        <BrowserToolbar
          className={classes.toolbar}
          handleGoBack={() => this.refs[BROWSER_REF].goBack()}
          handleGoForward={() => this.refs[BROWSER_REF].goForward()}
          handleStop={() => this.refs[BROWSER_REF].stop()}
          handleReload={() => this.refs[BROWSER_REF].reload()} />
        <div className={classes.webviewContainer}>
          <BrowserView
            ref={BROWSER_REF}
            src={url}
            partition={partition}
            plugins
            allowpopups
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
            onPermissionRequestsChanged={this.handlePermissionRequestsChanged}
            didNavigateInPage={(evt) => {
              if (evt.isMainFrame) { this.navigationStateDidChange(evt) }
            }} />
          <BrowserViewLoadBar isLoading={isLoading} />
          <BrowserViewTargetUrl url={targetUrl} />
          <BrowserViewPermissionRequests
            permissionRequests={permissionRequests}
            url={permissionRequestsUrl}
            onResolvePermission={this.handleResolvePermission} />
          <BrowserSearch ref={SEARCH_REF} />
        </div>
      </div>
    )
  }
}

export default BrowserScene
