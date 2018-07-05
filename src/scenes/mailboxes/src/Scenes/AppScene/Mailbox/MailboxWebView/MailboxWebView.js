import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import { accountStore, accountActions, accountDispatch } from 'stores/account'
import ServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ServiceDataReducer'
import BrowserView from 'wbui/Guest/BrowserView'
import MailboxSearch from './MailboxSearch'
import MailboxTargetUrl from './MailboxTargetUrl'
import MailboxLoadBar from './MailboxLoadBar'
import shallowCompare from 'react-addons-shallow-compare'
import CoreACService from 'shared/Models/ACAccounts/CoreACService'
import { URL } from 'url'
import { NotificationService } from 'Notifications'
import {
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP,
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN,
  WB_BROWSER_NOTIFICATION_CLICK,
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_INJECT_CUSTOM_CONTENT,
  WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED,
  WB_BROWSER_ALERT_PRESENT,
  WB_BROWSER_CONFIRM_PRESENT
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import Spinner from 'wbui/Activity/Spinner'
import { settingsStore } from 'stores/settings'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxInformationCover from './MailboxInformationCover'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import RefreshIcon from '@material-ui/icons/Refresh'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  root: {
    position: 'absolute',
    top: 10000,
    bottom: -10000,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',

    // Explicitly set the visibility on the webview element as this allows electron to prioritize resource consumption
    '& webview': { visibility: 'hidden' },

    '&.active': {
      top: 0,
      bottom: 0,

      // Explicitly set the visibility on the webview element as this allows electron to prioritize resource consumption
      '& webview': { visibility: 'visible' }
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
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  infoButtonIcon: {
    marginRight: 6
  }
}

const BROWSER_REF = 'browser'

@withStyles(styles)
class MailboxWebView extends React.Component {
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

    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function () {
        return self.refs[BROWSER_REF][m].apply(self.refs[BROWSER_REF], Array.from(arguments))
      }
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    accountStore.listen(this.accountChanged)

    // Handle dispatch events
    accountDispatch.on('devtools', this.handleOpenDevTools)
    accountDispatch.on('refocus', this.handleRefocus)
    accountDispatch.on('reload', this.handleReload)
    accountDispatch.addGetter('current-url', this.handleGetCurrentUrl)
    accountDispatch.on('navigateBack', this.handleNavigateBack)
    accountDispatch.on('navigateForward', this.handleNavigateForward)

    if (!this.state.isActive) {
      if (this.refs[BROWSER_REF]) {
        this.refs[BROWSER_REF].send(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP, {})
      }
    }
  }

  componentWillUnmount () {
    // Stores
    accountStore.unlisten(this.accountChanged)

    // Handle dispatch events
    accountDispatch.removeListener('devtools', this.handleOpenDevTools)
    accountDispatch.removeListener('refocus', this.handleRefocus)
    accountDispatch.removeListener('reload', this.handleReload)
    accountDispatch.removeGetter('current-url', this.handleGetCurrentUrl)
    accountDispatch.removeListener('navigateBack', this.handleNavigateBack)
    accountDispatch.removeListener('navigateForward', this.handleNavigateForward)

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
      focusedUrl: null,
      snapshot: accountState.getSnapshot(serviceId),
      isActive: accountState.activeServiceId() === serviceId,
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId),
      searchId: accountState.serviceSearchHash(serviceId),
      isolateMailboxProcesses: settingsStore.getState().launched.app.isolateMailboxProcesses, // does not update
      serviceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      ...(!mailbox || !service ? {
        mailbox: null,
        service: null,
        baseUrl: 'about:blank',
        restorableUrl: 'about:blank'
      } : {
        mailbox: mailbox,
        service: service,
        baseUrl: service.url,
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
        return {
          mailbox: mailbox,
          service: service,
          snapshot: accountState.getSnapshot(serviceId),
          isActive: accountState.activeServiceId() === serviceId,
          isSearching: accountState.isSearchingService(serviceId),
          searchTerm: accountState.serviceSearchTerm(serviceId),
          searchId: accountState.serviceSearchHash(serviceId),
          serviceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
          ...(prevState.baseUrl !== service.url ? {
            baseUrl: service.url,
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
  // WebView overwrites
  /* **************************************************************************/

  /**
  * @Pass through to webview.loadURL()
  */
  loadURL = (url) => {
    return this.refs[BROWSER_REF].loadURL(url)
  }

  /**
  * @return the dom node for the webview
  */
  getWebviewNode = () => {
    return this.refs[BROWSER_REF].getWebviewNode()
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles the inspector dispatch event
  * @param evt: the event that fired
  */
  handleOpenDevTools = (evt) => {
    const isThisTab = evt.servceId === this.props.serviceId || (!evt.service && this.state.isActive)
    if (isThisTab) {
      this.refs[BROWSER_REF].openDevTools()
    }
  }

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  handleRefocus = (evt) => {
    const isThisTab = evt.servceId === this.props.serviceId || (!evt.service && this.state.isActive)
    if (isThisTab) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  }

  /**
  * Handles reloading the mailbox
  * @param evt: the event that fired
  */
  handleReload = (evt) => {
    const { mailboxId, serviceId } = this.props
    const { isActive, service } = this.state
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
          this.loadURL(service.url)
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
    const isThisTab = evt.servceId === this.props.serviceId
    if (isThisTab) {
      return this.refs[BROWSER_REF].getURL()
    } else {
      return null
    }
  }

  /**
  * Handles a navigate back call being made
  */
  handleNavigateBack = () => {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].goBack()
    }
  }

  /**
  * Handles a navigate forward call being made
  */
  handleNavigateForward = () => {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].goForward()
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
              this.refs[BROWSER_REF].send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
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
    const { service, isActive } = this.state

    // Push the custom user content
    if (service.hasCustomCSS || service.hasCustomJS) {
      this.refs[BROWSER_REF].send(WB_BROWSER_INJECT_CUSTOM_CONTENT, {
        css: service.customCSS,
        js: service.customJS
      })
    }

    // Wake or sleep the browser
    if (isActive) {
      this.refs[BROWSER_REF].send(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN, {})
    } else {
      this.refs[BROWSER_REF].send(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP, {})
    }

    this.setState({ initialLoadDone: true })
  }

  /**
  * Updates the store with the current page title
  * @param evt: the event that fired
  */
  handleBrowserPageTitleUpdated = (evt) => {
    accountActions.reduceServiceData(
      this.props.serviceId,
      ServiceDataReducer.setDocumentTitle,
      evt.title
    )
  }

  /**
  * Handles the browser navigating
  * @param evt: the event that fired
  */
  handleBrowserDidNavigate = (evt) => {
    if (evt.url && evt.url !== 'about:blank') {
      accountActions.reduceServiceData(
        this.props.serviceId,
        ServiceDataReducer.setUrl,
        evt.url
      )
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
    accountActions.reduceServiceData(
      this.props.serviceId,
      ServiceDataReducer.setFavicons,
      evt.favicons
    )
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
    this.setState({ isLoading: true })
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
  * @param webContents: the webcontents that were attached
  */
  handleWebContentsAttached = (webContents) => {
    const { mailboxId, serviceId } = this.props
    ipcRenderer.send(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, {
      webContentsId: webContents.id,
      mailboxId: mailboxId,
      serviceId: serviceId
    })

    // Update the store
    accountActions.setWebcontentTabId.defer(serviceId, webContents.id)
  }

  /**
  * Handles the webview crashing
  * @param evt: the event that fired
  */
  handleCrashed = (evt) => {
    console.log(`WebView Crashed ${this.props.mailboxId}:${this.props.serviceId}`, evt)
    this.setState({ isCrashed: true })
  }

  /* **************************************************************************/
  // Browser Events : Navigation
  /* **************************************************************************/

  /**
  * Handles a browser preparing to navigate
  * @param evt: the event that fired
  */
  handleBrowserWillNavigate = (evt) => {
    // the lamest protection again dragging files into the window
    // but this is the only thing I could find that leaves file drag working
    if (evt.url.indexOf('file://') === 0) {
      this.setState((prevState) => {
        const purl = new URL(prevState.url)
        purl.searchParams.set('__v__', new Date().getTime())
        return { url: purl.toString() }
      })
    }
  }

  /* **************************************************************************/
  // Browser Events : Focus
  /* **************************************************************************/

  /**
  * Handles a browser focusing
  */
  handleBrowserFocused () {
    accountDispatch.focused(this.props.serviceId)
  }

  /**
  * Handles a browser un-focusing
  */
  handleBrowserBlurred () {
    accountDispatch.blurred(this.props.serviceId)
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
        if (this.refs[BROWSER_REF]) {
          this.refs[BROWSER_REF].focus()
          this.refs[BROWSER_REF].send(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN, {})
        }
      } else {
        if (this.refs[BROWSER_REF]) {
          this.refs[BROWSER_REF].send(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP, {})
        }
      }
    }
  }

  render () {
    // Extract our props and pass props
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
      serviceAuthInvalid
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

    // Don't use string templating or inline in jsx. The compiler optimizes it out!!
    const webpreferences = [
      'contextIsolation=yes',
      'nativeWindowOpen=yes',
      'sharedSiteInstances=yes',
      'sandbox=yes',
      'affinity=' + (isolateMailboxProcesses ? mailboxId + ':' + serviceId : mailboxId)
    ].filter((l) => !!l).join(', ')
    const preloadScripts = [
      Resolver.guestPreload(),
      Resolver.crExtensionApiPreload()
    ].join('_wavebox_preload_split_')

    return (
      <div className={classNames(classes.root, className, isActive ? 'active' : undefined)}>
        <div className={classes.browserContainer}>
          <BrowserView
            ref={BROWSER_REF}
            id={`guest_${mailbox.id}_${service.type}`}
            preload={preloadScripts}
            partition={mailbox.partition}
            src={restorableUrl || 'about:blank'}
            searchId={searchId}
            searchTerm={isSearching ? searchTerm : ''}
            webpreferences={webpreferences}
            allowpopups={allowpopups === undefined ? true : allowpopups}
            plugins
            onWebContentsAttached={this.handleWebContentsAttached}

            {...webviewEventProps}

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
            willNavigate={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserWillNavigate, webviewEventProps.willNavigate], [evt])
            }}
            focus={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserFocused, webviewEventProps.focus], [evt])
            }}
            blur={(evt) => {
              this.multiCallBrowserEvent([this.handleBrowserBlurred, webviewEventProps.blur], [evt])
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
              this.multiCallBrowserEvent([this.handleDidStopLoading, webviewEventProps.handleDidStopLoading], [evt])
            }}
          />
        </div>
        {initialLoadDone || !snapshot ? undefined : (
          <div className={classes.snapshot} style={{ backgroundImage: `url("${snapshot}")` }} />
        )}
        {!service.hasNavigationToolbar && !initialLoadDone ? (
          <div className={classes.loader}>
            <Spinner size={50} color={lightBlue[600]} speed={0.75} />
          </div>
        ) : undefined}
        <MailboxLoadBar isLoading={isLoading} />
        <MailboxTargetUrl url={focusedUrl} />
        {hasSearch ? (
          <MailboxSearch mailboxId={mailbox.id} serviceId={serviceId} />
        ) : undefined}
        {isCrashed ? (
          <MailboxInformationCover
            title='Whoops!'
            text={['Something went wrong with this tab and it crashed']}
            button={(
              <Button
                variant='raised'
                onClick={() => {
                  this.setState({ isCrashed: false }) // Update our crashed state
                  this.refs[BROWSER_REF].reset()
                }}>
                <RefreshIcon className={classes.infoButtonIcon} />
                Reload
              </Button>
            )} />
        ) : undefined}
        {serviceAuthInvalid ? (
          <MailboxInformationCover
            title='Whoops!'
            IconComponent={ErrorOutlineIcon}
            text={[
              `There's an authentication problem with this account.`,
              `Wavebox either doesn't have any authentication information for this account or it's invalid`
            ]}
            button={(
              <Button
                variant='raised'
                onClick={() => { accountActions.reauthenticateService(serviceId) }}>
                <ErrorOutlineIcon className={classes.infoButtonIcon} />
                Reauthenticate
              </Button>
            )} />
        ) : undefined}
      </div>
    )
  }
}

export default MailboxWebView
