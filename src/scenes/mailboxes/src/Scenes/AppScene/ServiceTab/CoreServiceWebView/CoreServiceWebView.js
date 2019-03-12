import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions, accountDispatch } from 'stores/account'
import ServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ServiceDataReducer'
import BrowserView from 'wbui/Guest/BrowserView'
import BrowserViewLoadBar from 'wbui/Guest/BrowserViewLoadBar'
import BrowserViewTargetUrl from 'wbui/Guest/BrowserViewTargetUrl'
import BrowserViewPermissionRequests from 'wbui/Guest/BrowserViewPermissionRequests'
import ServiceSearch from './ServiceSearch'
import shallowCompare from 'react-addons-shallow-compare'
import CoreACService from 'shared/Models/ACAccounts/CoreACService'
import { NotificationService } from 'Notifications'
import {
  WB_BROWSER_NOTIFICATION_CLICK,
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_INJECT_CUSTOM_CONTENT,
  WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED,
  WB_BROWSER_ALERT_PRESENT,
  WB_BROWSER_CONFIRM_PRESENT
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { settingsStore } from 'stores/settings'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ServiceInvalidAuthCover from './ServiceInvalidAuthCover'
import ServiceCrashedCover from './ServiceCrashedCover'
import ServiceSleepHelper from './ServiceSleepHelper'
import ServiceLoadErrorCover from './ServiceLoadErrorCover'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',

    // Explicitly set the visibility on the webview element as this allows electron to prioritize resource consumption
    '& webview': { visibility: 'hidden' },

    '&.active': {
      // Explicitly set the visibility on the webview element as this allows electron to prioritize resource consumption
      '& webview': { visibility: 'visible' }
    },

    '&.high-power-always': {
      '& webview': { visibility: 'visible !important' }
    }
  },
  browserContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  snapshot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class CoreServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = Object.assign({
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    hasSearch: PropTypes.bool.isRequired,
    plugHTML5Notifications: PropTypes.bool.isRequired
  }, BrowserView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[name] = PropTypes.func
    return acc
  }, {}))
  static defaultProps = {
    hasSearch: true,
    plugHTML5Notifications: true
  }
  static WEBVIEW_METHODS = BrowserView.WEBVIEW_METHODS
  static REACT_WEBVIEW_EVENTS = BrowserView.REACT_WEBVIEW_EVENTS

  /* **************************************************************************/
  // Object Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.browserRef = React.createRef()

    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function (...args) {
        return self.browserRef.current[m](...args)
      }
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.webviewRestartTO = null

    // Stores
    accountStore.listen(this.accountChanged)

    // Handle dispatch events
    accountDispatch.on('devtools', this.handleOpenDevTools)
    accountDispatch.on('refocus', this.handleRefocus)
    accountDispatch.on('reload', this.handleReload)
    accountDispatch.addGetter('current-url', this.handleGetCurrentUrl)
    accountDispatch.addGetter('is-webview-mounted', this.handleGetIsWebviewMounted)
    accountDispatch.on('navigateBack', this.handleNavigateBack)
    accountDispatch.on('navigateForward', this.handleNavigateForward)
    accountDispatch.on('loadUrl', this.handleNavigateLoadUrl)
  }

  componentWillUnmount () {
    clearTimeout(this.webviewRestartTO)

    // Stores
    accountStore.unlisten(this.accountChanged)

    // Handle dispatch events
    accountDispatch.removeListener('devtools', this.handleOpenDevTools)
    accountDispatch.removeListener('refocus', this.handleRefocus)
    accountDispatch.removeListener('reload', this.handleReload)
    accountDispatch.removeGetter('current-url', this.handleGetCurrentUrl)
    accountDispatch.removeGetter('is-webview-mounted', this.handleGetIsWebviewMounted)
    accountDispatch.removeListener('navigateBack', this.handleNavigateBack)
    accountDispatch.removeListener('navigateForward', this.handleNavigateForward)
    accountDispatch.removeListener('loadUrl', this.handleNavigateLoadUrl)

    // Update the store
    accountActions.deleteWebcontentTabId.defer(this.props.serviceId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const { mailboxId, serviceId } = props
    const accountState = accountStore.getState()
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    const authData = accountState.getMailboxAuthForServiceId(serviceId)

    return {
      initialLoadDone: false,
      isLoading: false,
      isCrashed: false,
      loadError: null,
      focusedUrl: null,
      webContentsAttached: false,
      permissionRequests: [],
      permissionRequestsUrl: undefined,
      snapshot: accountState.getSnapshot(serviceId),
      isActive: accountState.activeServiceId() === serviceId,
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId),
      searchId: accountState.serviceSearchHash(serviceId),
      isolateMailboxProcesses: settingsStore.getState().launched.app.isolateMailboxProcesses, // does not update
      authDataId: (authData || {}).id,
      ...(!mailbox || !service ? {
        mailbox: null,
        service: null,
        restorableUrlHash: 'undefined:about:blank',
        restorableUrl: 'about:blank'
      } : {
        mailbox: mailbox,
        service: service,
        restorableUrlHash: `${(authData || {}).id}:${service.url}`,
        restorableUrl: service.getUrlWithData(serviceData, authData)
      })
    }
  }

  accountChanged = (accountState) => {
    const { mailboxId, serviceId } = this.props
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    const authData = accountState.getMailboxAuthForServiceId(serviceId)

    if (mailbox && service) {
      this.setState((prevState) => {
        const restorableUrlHash = `${(authData || {}).id}:${service.url}`

        return {
          mailbox: mailbox,
          service: service,
          snapshot: accountState.getSnapshot(serviceId),
          isActive: accountState.activeServiceId() === serviceId,
          isSearching: accountState.isSearchingService(serviceId),
          searchTerm: accountState.serviceSearchTerm(serviceId),
          searchId: accountState.serviceSearchHash(serviceId),
          authDataId: (authData || {}).id,
          ...(prevState.restorableUrlHash !== restorableUrlHash ? {
            restorableUrlHash: restorableUrlHash,
            restorableUrl: service.getUrlWithData(serviceData, authData),
            initialLoadDone: false
          } : {})
        }
      })
    } else {
      this.setState({ mailbox: null, service: null })
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Resets the webview
  * @param evt: the event that fired
  */
  handleUncrash = (evt) => {
    this.setState({ isCrashed: false }) // Update our crashed state
    this.browserRef.current.reset()
  }

  /**
  * Clears a load error
  * @param evt: the event that fired
  */
  handleClearLoadError = (evt) => {
    this.setState({ loadError: null })
    this.browserRef.current.reload()
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
  // WebView overwrites
  /* **************************************************************************/

  /**
  * @Pass through to webview.loadURL()
  */
  loadURL = (url) => {
    return this.browserRef.current.loadURL(url)
  }

  /**
  * @return the dom node for the webview
  */
  getWebviewNode = () => {
    return this.browserRef.current.getWebviewNode()
  }

  /**
  * @return true if the webview is attached
  */
  isWebviewAttached = () => {
    return this.browserRef.current.isWebviewAttached()
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles the inspector dispatch event
  * @param evt: the event that fired
  */
  handleOpenDevTools = (evt) => {
    const isThisTab = evt.serviceId === this.props.serviceId || (!evt.serviceId && this.state.isActive)
    if (isThisTab) {
      this.browserRef.current.openDevTools()
    }
  }

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  handleRefocus = (evt) => {
    const isThisTab = evt.serviceId === this.props.serviceId || (!evt.serviceId && this.state.isActive)
    if (isThisTab) {
      setTimeout(() => { this.browserRef.current.focus() })
    }
  }

  /**
  * Handles reloading the mailbox
  * @param evt: the event that fired
  */
  handleReload = (evt) => {
    const { mailboxId, serviceId } = this.props
    const { isActive, service, restorableUrl } = this.state
    let isThisTab = false
    if (evt.mailboxId || evt.serviceId) {
      if (evt.mailboxId === mailboxId) {
        isThisTab = true
      } else if (evt.serviceId === serviceId) {
        isThisTab = true
      }
    } else if (isActive) {
      isThisTab = true
    }

    if (isThisTab) {
      if (service) {
        if (service.reloadBehaviour === CoreACService.RELOAD_BEHAVIOURS.RELOAD) {
          this.reload()
        } else if (service.reloadBehaviour === CoreACService.RELOAD_BEHAVIOURS.RESET_URL) {
          this.loadURL(restorableUrl)
        }
      } else {
        this.reload()
      }
    }
  }

  /**
  * Handles getting the current url
  * @param evt: the event that fired
  * @return the current url or null if not applicable for use
  */
  handleGetCurrentUrl = (evt) => {
    return evt.serviceId === this.props.serviceId
      ? this.browserRef.current.getURL()
      : null
  }

  /**
  * Handles getting if the webview is mounted
  * @param evt: the event that fired
  * @return true if we're mounted, or null if not applicable for us
  */
  handleGetIsWebviewMounted = (evt) => {
    return evt.serviceId === this.props.serviceId
      ? this.state.webContentsAttached
      : null
  }

  /**
  * Handles a navigate back call being made
  */
  handleNavigateBack = () => {
    if (this.state.isActive) {
      this.browserRef.current.goBack()
    }
  }

  /**
  * Handles a navigate forward call being made
  */
  handleNavigateForward = () => {
    if (this.state.isActive) {
      this.browserRef.current.goForward()
    }
  }

  /**
  * Handles a load url event being fored
  * @Param evt: the event that fired
  */
  handleNavigateLoadUrl = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      this.browserRef.current.loadURL(evt.url)
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Calls multiple handlers for browser events
  * @param callers: a list of callers to execute
  * @param args: the arguments to supply them with
  */
  multiCallBrowserEvent (callers, args) {
    callers.forEach((caller) => {
      if (caller) {
        caller.apply(this, args)
      }
    })
  }

  /* **************************************************************************/
  // Browser Events : Dispatcher
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  dispatchBrowserIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT:
        if (this.props.plugHTML5Notifications) {
          NotificationService.processHTML5MailboxNotification(
            this.props.mailboxId,
            this.props.serviceId,
            evt.channel.notificationId,
            evt.channel.notification,
            (notificationId) => {
              this.browserRef.current.send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
            }
          )
        }
        break
      case WB_BROWSER_CONFIRM_PRESENT:
      case WB_BROWSER_ALERT_PRESENT:
        accountActions.changeActiveService(this.props.serviceId)
        break
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady = () => {
    const { service } = this.state
    const node = this.browserRef.current

    // Push the custom user content
    if (service.hasCustomCSS || service.hasCustomJS) {
      node.send(WB_BROWSER_INJECT_CUSTOM_CONTENT, { css: service.customCSS, js: service.customJS })
    }

    this.setState({ initialLoadDone: true })
  }

  /**
  * Updates the store with the current page title
  * @param evt: the event that fired
  */
  handleBrowserPageTitleUpdated = (evt) => {
    const { serviceId } = this.props
    accountActions.reduceServiceData(serviceId, ServiceDataReducer.setDocumentTitle, evt.title)
  }

  /**
  * Handles the browser navigating
  * @param evt: the event that fired
  */
  handleBrowserDidNavigate = (evt) => {
    const { serviceId } = this.props
    if (evt.url && evt.url !== 'about:blank') {
      accountActions.reduceServiceData(serviceId, ServiceDataReducer.setUrl, evt.url)
    }
  }

  /**
  * Handles the browser navigating in page
  * @param evt: the event that fired
  */
  handleBrowserDidNavigateInPage = (evt) => {
    if (evt.isMainFrame && evt.url && evt.url !== 'about:blank') {
      accountActions.reduceServiceData(
        this.props.serviceId,
        ServiceDataReducer.setUrl,
        evt.url
      )
    }
  }

  /**
  * Handles the browser theme updating
  * @param evt: the event that fired
  */
  handleBrowserThemeUpdated = (evt) => {
    accountActions.reduceServiceData(
      this.props.serviceId,
      ServiceDataReducer.setDocumentTheme,
      evt.themeColor
    )
  }

  /**
  * Handles the browser favicon updating
  * @param evt: the event that fired
  */
  handleBrowserFaviconsUpdated = (evt) => {
    const { serviceId } = this.props
    accountActions.reduceServiceData(serviceId, ServiceDataReducer.setFavicons, evt.favicons)
  }

  /**
  * Updates the target url that the user is hovering over
  * @param evt: the event that fired
  */
  handleBrowserUpdateTargetUrl = (evt) => {
    this.setState({ focusedUrl: evt.url !== '' ? evt.url : null })
  }

  /**
  * Handles a load starting
  * @param evt: the event that fired
  */
  handleDidStartLoading = (evt) => {
    this.setState({
      isLoading: true,
      loadError: null
    })
  }

  /**
  * Handles a load stopping
  * @param evt: the event that fired
  */
  handleDidStopLoading = (evt) => {
    this.setState({
      isLoading: false,
      initialLoadDone: true
    })
  }

  /**
  * Handles the webcontents being attached
  * @param evt: the event that fired
  */
  handleWebContentsAttached = (evt) => {
    const attachedId = evt.target.getWebContents().id
    const { mailboxId, serviceId } = this.props
    ipcRenderer.send(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, {
      webContentsId: attachedId,
      mailboxId: mailboxId,
      serviceId: serviceId
    })
    this.setState({ webContentsAttached: true })

    // Update the store
    accountActions.setWebcontentTabId.defer(serviceId, attachedId)
  }

  /**
  * Handles the webview crashing
  * @param evt: the event that fired
  */
  handleCrashed = (evt) => {
    console.log(`WebView Crashed ${this.props.mailboxId}:${this.props.serviceId}`, evt)
    this.setState({ isCrashed: true })
  }

  /**
  * Handles a load error
  * @param evt: the event that fired
  */
  handleLoadError = (evt) => {
    if (!evt.isMainFrame) { return }
    if (!ServiceLoadErrorCover.HANDLED_ERROR_CODES.has(evt.errorCode)) { return }

    this.setState({
      loadError: {
        code: evt.errorCode,
        description: evt.errorDescription,
        url: evt.validatedURL
      }
    })
  }

  /**
  * Handles the pending permission requests changing
  */
  handlePermissionRequestsChanged = (evt) => {
    this.setState({
      permissionRequests: evt.pending,
      permissionRequestsUrl: evt.url
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.isActive !== this.state.isActive) {
      if (this.state.isActive) {
        if (this.browserRef.current) {
          this.browserRef.current.focus()
        }
      }
    }
  }

  render () {
    const {
      mailbox,
      service,
      isActive,
      focusedUrl,
      isSearching,
      searchTerm,
      searchId,
      restorableUrl,
      initialLoadDone,
      isCrashed,
      isLoading,
      snapshot,
      isolateMailboxProcesses,
      authDataId,
      permissionRequests,
      permissionRequestsUrl,
      loadError
    } = this.state

    if (!mailbox || !service) { return false }
    const {
      classes,
      className,
      hasSearch,
      allowpopups,
      mailboxId,
      serviceId,
      ...passProps
    } = this.props
    const webviewEventProps = BrowserView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
      acc[name] = this.props[name]
      delete passProps[name]
      return acc
    }, {})

    // Figure out the config for the webview...
    const affinity = (isolateMailboxProcesses
      ? mailboxId + ':' + serviceId
      : (service.partitionId.startsWith('persist:') // Use the affinity so sandboxed services don't crash out
        ? service.partitionId.substr(8)
        : service.partitionId
      )
    )
    const webpreferences = [ // Don't use string templating or inline in jsx. The compiler optimizes it out!!
      'contextIsolation=yes',
      'nativeWindowOpen=yes',
      'sharedSiteInstances=yes',
      'sandbox=yes',
      'affinity=' + affinity
    ].filter((l) => !!l).join(', ')
    const webviewId = [
      'guest',
      mailbox.id,
      service.id,
      service.type
    ].join('_')
    const webviewKey = [
      'guest',
      mailbox.id,
      service.id,
      service.type,
      service.partitionId,
      authDataId // If the auth-id changes we want to do a hard reset of the WV
    ].join('_')

    return (
      <div
        className={classNames(
          classes.root,
          className,
          isActive ? 'active' : undefined,
          service.preventLowPowerMode ? 'high-power-always' : undefined
        )}>
        <div className={classes.browserContainer}>
          <BrowserView
            ref={this.browserRef}
            key={webviewKey}
            id={webviewId}
            preload={Resolver.guestPreload()}
            preloadCrx={Resolver.crExtensionApiPreload()}
            partition={service.partitionId}
            src={restorableUrl || 'about:blank'}
            searchId={searchId}
            searchTerm={isSearching ? searchTerm : ''}
            webpreferences={webpreferences}
            allowpopups={allowpopups === undefined ? true : allowpopups}
            plugins

            {...webviewEventProps}
            didFailLoad={(evt) => {
              this.multiCallBrowserEvent([this.handleLoadError, webviewEventProps.didFailLoad], [evt])
            }}
            didAttach={(evt) => {
              this.multiCallBrowserEvent([this.handleWebContentsAttached, webviewEventProps.didAttach], [evt])
            }}
            crashed={(evt) => {
              this.multiCallBrowserEvent([this.handleCrashed, webviewEventProps.crashed], [evt])
            }}
            pageTitleUpdated={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserPageTitleUpdated, webviewEventProps.pageTitleUpdated], [evt])
            }}
            didChangeThemeColor={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserThemeUpdated, webviewEventProps.didChangeThemeColor], [evt])
            }}
            pageFaviconUpdated={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserFaviconsUpdated, webviewEventProps.pageFaviconUpdated], [evt])
            }}
            domReady={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserDomReady, webviewEventProps.domReady], [evt])
            }}
            ipcMessage={(evt) => {
              this.multiCallBrowserEvent([this.dispatchBrowserIPCMessage, webviewEventProps.ipcMessage], [evt])
            }}
            updateTargetUrl={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserUpdateTargetUrl, webviewEventProps.updateTargetUrl], [evt])
            }}
            didNavigate={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserDidNavigate, webviewEventProps.didNavigate], [evt])
            }}
            didNavigateInPage={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserDidNavigateInPage, webviewEventProps.didNavigateInPage], [evt])
            }}
            didStartLoading={(evt) => {
              this.multiCallBrowserEvent([this.handleDidStartLoading, webviewEventProps.didStartLoading], [evt])
            }}
            didStopLoading={(evt) => {
              this.multiCallBrowserEvent([this.handleDidStopLoading, webviewEventProps.didStopLoading], [evt])
            }}
            onPermissionRequestsChanged={(evt) => {
              this.multiCallBrowserEvent([this.handlePermissionRequestsChanged, webviewEventProps.handlePermissionRequestsChanged], [evt])
            }}
          />
        </div>
        {initialLoadDone || !snapshot ? undefined : (
          <div className={classes.snapshot} style={{ backgroundImage: `url("${snapshot}")` }} />
        )}
        {!initialLoadDone ? (
          <ServiceSleepHelper
            serviceId={serviceId}
            onRequestClose={() => this.setState({ initialLoadDone: true })} />
        ) : undefined}
        <BrowserViewLoadBar isLoading={isLoading} />
        <BrowserViewTargetUrl url={focusedUrl} />
        <BrowserViewPermissionRequests
          permissionRequests={permissionRequests}
          url={permissionRequestsUrl}
          onResolvePermission={this.handleResolvePermission} />
        {hasSearch ? (
          <ServiceSearch mailboxId={mailbox.id} serviceId={serviceId} />
        ) : undefined}
        <ServiceLoadErrorCover loadError={loadError} attemptReload={this.handleClearLoadError} />
        <ServiceCrashedCover isCrashed={isCrashed} attemptUncrash={this.handleUncrash} />
        <ServiceInvalidAuthCover serviceId={serviceId} />
      </div>
    )
  }
}

export default CoreServiceWebView
