import './MailboxWebView.less'
import PropTypes from 'prop-types'
import React from 'react'
import { CircularProgress } from 'material-ui'
import { mailboxStore, mailboxDispatch } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import BrowserView from 'sharedui/Components/BrowserView'
import MailboxSearch from './MailboxSearch'
import MailboxTargetUrl from './MailboxTargetUrl'
import shallowCompare from 'react-addons-shallow-compare'
import URI from 'urijs'
const { ipcRenderer } = window.nativeRequire('electron')

const BROWSER_REF = 'browser'

export default class MailboxWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = Object.assign({
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    preload: PropTypes.string,
    url: PropTypes.string,
    hasSearch: PropTypes.bool.isRequired
  }, BrowserView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[name] = PropTypes.func
    return acc
  }, {}))
  static defaultProps = {
    hasSearch: true
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
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.on('devtools', this.handleOpenDevTools)
    mailboxDispatch.on('refocus', this.handleRefocus)
    mailboxDispatch.on('reload', this.handleReload)
    mailboxDispatch.on('ping-resource-usage', this.pingResourceUsage)
    mailboxDispatch.addGetter('current-url', this.handleGetCurrentUrl)
    ipcRenderer.on('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.on('mailbox-window-navigate-forward', this.handleIPCNavigateForward)
  }

  componentWillUnmount () {
    // Stores
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.removeListener('devtools', this.handleOpenDevTools)
    mailboxDispatch.removeListener('refocus', this.handleRefocus)
    mailboxDispatch.removeListener('reload', this.handleReload)
    mailboxDispatch.removeListener('ping-resource-usage', this.pingResourceUsage)
    mailboxDispatch.removeGetter('current-url', this.handleGetCurrentUrl)
    ipcRenderer.removeListener('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.removeListener('mailbox-window-navigate-forward', this.handleIPCNavigateForward)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      this.setState(this.generateState(nextProps))
    } else if (this.props.url !== nextProps.url) {
      this.setState((prevState) => {
        return {
          url: nextProps.url || (prevState.service || {}).url,
          browserDOMReady: false
        }
      })
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
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(props.serviceType) : null
    const settingState = settingsStore.getState()

    return Object.assign(
      {},
      !mailbox || !service ? {
        mailbox: null,
        service: null,
        url: props.url || 'about:blank'
      } : {
        mailbox: mailbox,
        service: service,
        url: props.url || service.url
      },
      {
        browserDOMReady: false,
        language: settingState.language,
        focusedUrl: null,
        snapshot: mailboxState.getSnapshot(props.mailboxId, props.serviceType),
        isActive: mailboxState.isActive(props.mailboxId, props.serviceType),
        isSearching: mailboxState.isSearchingMailbox(props.mailboxId, props.serviceType),
        searchTerm: mailboxState.mailboxSearchTerm(props.mailboxId, props.serviceType),
        searchId: mailboxState.mailboxSearchHash(props.mailboxId, props.serviceType)
      }
    )
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null

    if (mailbox && service) {
      this.setState({
        mailbox: mailbox,
        service: service,
        isActive: mailboxState.isActive(mailboxId, serviceType),
        snapshot: mailboxState.getSnapshot(mailboxId, serviceType),
        isSearching: mailboxState.isSearchingMailbox(mailboxId, serviceType),
        searchTerm: mailboxState.mailboxSearchTerm(mailboxId, serviceType),
        searchId: mailboxState.mailboxSearchHash(mailboxId, serviceType)
      })
    } else {
      this.setState({ mailbox: null, service: null })
    }
  }

  settingsChanged = (settingsState) => {
    this.setState((prevState) => {
      const update = {
        language: settingsState.language
      }

      // Siphon setting changes down to the webview
      if (settingsState.language !== prevState.language) {
        const prevLanguage = prevState.language
        const nextLanguage = update.language
        if (prevLanguage.spellcheckerLanguage !== nextLanguage.spellcheckerLanguage || prevLanguage.secondarySpellcheckerLanguage !== nextLanguage.secondarySpellcheckerLanguage) {
          this.refs[BROWSER_REF].send('start-spellcheck', {
            language: nextLanguage.spellcheckerLanguage,
            secondaryLanguage: nextLanguage.secondarySpellcheckerLanguage
          })
        }
      }

      return update
    })
  }

  /* **************************************************************************/
  // WebView overwrites
  /* **************************************************************************/

  /**
  * @Pass through to webview.loadURL()
  */
  loadURL = (url) => {
    this.setState({ browserDOMReady: false })
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
    if (evt.mailboxId === this.props.mailboxId) {
      if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].openDevTools()
      } else if (evt.service === this.props.serviceType) {
        this.refs[BROWSER_REF].openDevTools()
      }
    }
  }

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  handleRefocus = (evt) => {
    if ((!evt.mailboxId || !evt.service) && this.state.isActive) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    } else if (evt.mailboxId === this.props.mailboxId && evt.service === this.props.serviceType) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  }

  /**
  * Handles reloading the mailbox
  * @param evt: the event that fired
  */
  handleReload = (evt) => {
    if (evt.mailboxId === this.props.mailboxId) {
      if (evt.allServices) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      } else if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      } else if (evt.service === this.props.serviceType) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      }
    }
  }

  /**
  * Pings the webview for the current resource usage
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param description: the description that can be passed around for the ping
  */
  pingResourceUsage = ({ mailboxId, serviceType, description }) => {
    if (mailboxId === this.props.mailboxId && serviceType === this.props.serviceType) {
      this.refs[BROWSER_REF].send('ping-resource-usage', { description: description })
    }
  }

  /**
  * Handles getting the current url
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the current url or null if not applicable for use
  */
  handleGetCurrentUrl = ({ mailboxId, serviceType }) => {
    if (mailboxId === this.props.mailboxId && serviceType === this.props.serviceType) {
      return this.refs[BROWSER_REF].getURL()
    } else {
      return null
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
  dispatchBrowserIPCMessage (evt) {
    switch (evt.channel.type) {
      case 'open-settings': window.location.hash = '/settings'; break
      case 'pong-resource-usage': ipcRenderer.send('pong-resource-usage', evt.channel.data); break
      default: break
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady = () => {
    const { service, language } = this.state

    // Language
    if (language.spellcheckerEnabled) {
      this.refs[BROWSER_REF].send('start-spellcheck', {
        language: language.spellcheckerLanguage,
        secondaryLanguage: language.secondarySpellcheckerLanguage
      })
    }

    // Push the custom user content
    if (service.hasCustomCSS || service.hasCustomJS) {
      this.refs[BROWSER_REF].send('inject-custom-content', {
        css: service.customCSS,
        js: service.customJS
      })
    }

    this.setState({ browserDOMReady: true })
  }

  /**
  * Updates the target url that the user is hovering over
  * @param evt: the event that fired
  */
  handleBrowserUpdateTargetUrl (evt) {
    this.setState({ focusedUrl: evt.url !== '' ? evt.url : null })
  }

  /* **************************************************************************/
  // Browser Events : Navigation
  /* **************************************************************************/

  /**
  * Handles a browser preparing to navigate
  * @param evt: the event that fired
  */
  handleBrowserWillNavigate (evt) {
    // the lamest protection again dragging files into the window
    // but this is the only thing I could find that leaves file drag working
    if (evt.url.indexOf('file://') === 0) {
      this.setState((prevState) => {
        return {
          url: URI(prevState.url).addSearch('__v__', new Date().getTime()).toString()
        }
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
    mailboxDispatch.focused(this.props.mailboxId, this.props.serviceType)
  }

  /**
  * Handles a browser un-focusing
  */
  handleBrowserBlurred () {
    mailboxDispatch.blurred(this.props.mailboxId, this.props.serviceType)
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles navigating the mailbox back
  */
  handleIPCNavigateBack = () => {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateBack()
    }
  }

  /**
  * Handles navigating the mailbox forward
  */
  handleIPCNavigateForward = () => {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateForward()
    }
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
        this.refs[BROWSER_REF].focus()
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
      url,
      browserDOMReady,
      snapshot
    } = this.state

    if (!mailbox || !service) { return false }
    const { className, preload, hasSearch, ...passProps } = this.props
    delete passProps.serviceType
    delete passProps.mailboxId
    const webviewEventProps = BrowserView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
      acc[name] = this.props[name]
      delete passProps[name]
      return acc
    }, {})

    // Prep Clasnames and other props
    const saltedClassName = [
      className,
      'ReactComponent-MailboxWebView',
      isActive ? 'active' : ''
    ].join(' ')

    return (
      <div className={saltedClassName}>
        <BrowserView
          ref={BROWSER_REF}
          preload={preload}
          partition={'persist:' + mailbox.partition}
          src={url}
          zoomFactor={service.zoomFactor}
          searchId={searchId}
          searchTerm={isSearching ? searchTerm : ''}
          webpreferences='contextIsolation=yes'

          {...webviewEventProps}

          loadCommit={(evt) => {
            this.multiCallBrowserEvent([webviewEventProps.loadCommit], [evt])
          }}
          didGetResponseDetails={(evt) => {
            this.multiCallBrowserEvent([webviewEventProps.didGetResponseDetails], [evt])
          }}
          didNavigate={(evt) => {
            this.multiCallBrowserEvent([webviewEventProps.didNavigate], [evt])
          }}
          didNavigateInPage={(evt) => {
            this.multiCallBrowserEvent([webviewEventProps.didNavigateInPage], [evt])
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
          }} />
        {browserDOMReady || !snapshot ? undefined : (
          <div className='ReactComponent-MailboxSnapshot' style={{ backgroundImage: `url("${snapshot}")` }} />
        )}
        {browserDOMReady ? undefined : (
          <div className='ReactComponent-MailboxLoader'>
            <CircularProgress size={80} thickness={5} />
          </div>
        )}
        <MailboxTargetUrl url={focusedUrl} />
        {hasSearch ? (
          <MailboxSearch mailboxId={mailbox.id} serviceType={service.type} />
        ) : undefined}
      </div>
    )
  }
}
