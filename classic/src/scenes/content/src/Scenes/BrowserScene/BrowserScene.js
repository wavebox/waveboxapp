import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import BrowserView from 'wbui/Guest/BrowserView'
import BrowserSearch from './BrowserSearch'
import BrowserToolbar from './BrowserToolbar'
import { browserActions, browserStore } from 'stores/browser'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import BrowserViewLoadBar from 'wbui/Guest/BrowserViewLoadBar'
import BrowserViewTargetUrl from 'wbui/Guest/BrowserViewTargetUrl'
import BrowserViewPermissionRequests from 'wbui/Guest/BrowserViewPermissionRequests'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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

  constructor (props) {
    super(props)

    this.toolbarRef = React.createRef()
    this.searchRef = React.createRef()
    this.browserRef = React.createRef()
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)

    WBRPCRenderer.browserWindow.on('focus', this.handleFocusWebview)
    this.refocusInterval = setInterval(this.handlePollFocusWebview, 500)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
    if (process.platform === 'darwin') {
      this.mouseNavigator.unregister()
    }
    WBRPCRenderer.browserWindow.removeListener('focus', this.handleFocusWebview)
    clearInterval(this.refocusInterval)
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
  * Handles the webcontents attaching
  */
  handleWebContentsAttached = () => {
    if (this.props.url && this.props.url !== 'about:blank') {
      this.handleFocusWebview()
    } else {
      this.toolbarRef.current.focusAddress()
    }
  }

  /**
  * Handles the navigation state changing
  * @param evt: an event which includes a url prop
  */
  navigationStateDidChange = (evt) => {
    if (evt.isMainFrame === false) { return } // if it's explicitly not main frame return
    if (evt.url) {
      browserActions.setCurrentUrl(evt.url)
    }
    browserActions.updateNavigationControls(
      this.browserRef.current.canGoBack(),
      this.browserRef.current.canGoForward()
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
    WBRPCRenderer.browserWindow.close()
  }

  /**
  * Handles a permission being resolved
  * @param type: the permission type
  * @param permission: the resolved permission
  */
  handleResolvePermission = (type, permission) => {
    if (this.browserRef.current) {
      this.browserRef.current.resolvePermissionRequest(type, permission)
    }
  }

  /* **************************************************************************/
  // Window events
  /* **************************************************************************/

  /**
  * Handles the window refocusing by pointing the focus back onto the active webview
  */
  handleFocusWebview = () => {
    if (window.location.hash.length <= 2) {
      this.browserRef.current.focus()
    }
  }

  /**
  * Handles polling the webview to refocus
  */
  handlePollFocusWebview = () => {
    if (!document.activeElement || document.activeElement.tagName !== 'WEBVIEW') {
      if (window.location.hash.length <= 2) {
        this.browserRef.current.focus()
      }
    }
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

    // The partition should be set on the will-attach-webview in the main thread
    // but this doesn't have the desired effect. Set it here for good-stead
    return (
      <div className={classes.scene}>
        <BrowserToolbar
          innerRef={this.toolbarRef}
          className={classes.toolbar}
          handleGoBack={() => this.browserRef.current.goBack()}
          handleGoForward={() => this.browserRef.current.goForward()}
          handleStop={() => this.browserRef.current.stop()}
          handleReload={() => this.browserRef.current.reload()}
          handleDownload={(url) => this.browserRef.current.getWebContents().downloadURL(url)}
          handleLoadUrl={(url) => this.browserRef.current.loadURL(url)} />
        <div className={classes.webviewContainer}>
          <BrowserView
            ref={this.browserRef}
            src={url || 'about:blank'}
            partition={partition}
            plugins
            allowpopups
            webpreferences='contextIsolation=yes, nativeWindowOpen=yes, sharedSiteInstances=yes, sandbox=yes'
            preload={Resolver.guestPreload()}
            preloadCrx={Resolver.crExtensionApiPreload()}
            searchTerm={isSearching ? searchTerm : undefined}
            searchId={searchNextHash}
            close={this.handleClose}
            updateTargetUrl={(evt) => browserActions.setTargetUrl(evt.url)}
            pageTitleUpdated={(evt) => browserActions.setPageTitle(evt.title)}
            didStartLoading={(evt) => browserActions.startLoading()}
            didStopLoading={(evt) => browserActions.stopLoading()}
            ipcMessage={this.handleBrowserIPCMessage}
            didNavigate={this.navigationStateDidChange}
            didAttach={this.handleWebContentsAttached}
            onPermissionRequestsChanged={this.handlePermissionRequestsChanged}
            didNavigateInPage={this.navigationStateDidChange} />
          <BrowserViewLoadBar isLoading={isLoading} />
          <BrowserViewTargetUrl url={targetUrl} />
          <BrowserViewPermissionRequests
            permissionRequests={permissionRequests}
            url={permissionRequestsUrl}
            onResolvePermission={this.handleResolvePermission} />
          <BrowserSearch ref={this.searchRef} />
        </div>
      </div>
    )
  }
}

export default BrowserScene
