import './MailboxWebView.less'
const React = require('react')
const { CircularProgress } = require('material-ui')
const { mailboxStore, mailboxActions, mailboxDispatch } = require('stores/mailbox')
const { settingsStore } = require('stores/settings')
const { ipcRenderer } = window.nativeRequire('electron')
const WebView = require('shared/Components/WebView')
const MailboxSearch = require('./MailboxSearch')
const MailboxTargetUrl = require('./MailboxTargetUrl')
const shallowCompare = require('react-addons-shallow-compare')
const URI = require('urijs')

const BROWSER_REF = 'browser'
const SEARCH_REF = 'search'

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxWebView',
  propTypes: Object.assign({
    mailboxId: React.PropTypes.string.isRequired,
    serviceType: React.PropTypes.string.isRequired,
    preload: React.PropTypes.string,
    url: React.PropTypes.string
  }, WebView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[name] = React.PropTypes.func
    return acc
  }, {})),

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.on('devtools', this.handleOpenDevTools)
    mailboxDispatch.on('refocus', this.handleRefocus)
    mailboxDispatch.on('reload', this.handleReload)
    mailboxDispatch.respond('fetch-process-memory-info', this.handleFetchProcessMemoryInfo)
    ipcRenderer.on('find-start', this.handleIPCSearchStart)
    ipcRenderer.on('find-next', this.handleIPCSearchNext)
    ipcRenderer.on('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.on('mailbox-window-navigate-forward', this.handleIPCNavigateForward)

    // Autofocus on the first run
    if (this.state.isActive) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  },

  componentWillUnmount () {
    // Stores
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.removeListener('devtools', this.handleOpenDevTools)
    mailboxDispatch.removeListener('refocus', this.handleRefocus)
    mailboxDispatch.removeListener('reload', this.handleReload)
    mailboxDispatch.unrespond('fetch-process-memory-info', this.handleFetchProcessMemoryInfo)
    ipcRenderer.removeListener('find-start', this.handleIPCSearchStart)
    ipcRenderer.removeListener('find-next', this.handleIPCSearchNext)
    ipcRenderer.removeListener('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.removeListener('mailbox-window-navigate-forward', this.handleIPCNavigateForward)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      this.replaceState(this.getInitialState(nextProps))
    } else if (this.props.url !== nextProps.url) {
      this.setState((prevState) => {
        return {
          url: nextProps.url || (prevState.service || {}).url,
          browserDOMReady: false
        }
      })
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox.serviceForType(props.serviceType)
    const settingState = settingsStore.getState()

    const isActive = mailboxState.isActive(props.mailboxId, props.serviceType)
    return {
      mailbox: mailbox,
      service: service,
      url: props.url || service.url,
      browserDOMReady: false,
      isActive: isActive,
      isSearching: mailboxState.isSearchingMailbox(props.mailboxId, props.serviceType),
      language: settingState.language,
      focusedUrl: null,
      snapshot: mailboxState.getSnapshot(props.mailboxId, props.serviceType)
    }
  },

  mailboxesChanged (mailboxState) {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null

    if (mailbox && service) {
      this.setState((prevState) => {
        // Push down zoom state
        if (prevState.service.zoomFactor !== service.zoomFactor) {
          this.refs[BROWSER_REF].setZoomLevel(service.zoomFactor)
        }

        return {
          mailbox: mailbox,
          service: service,
          isActive: mailboxState.isActive(mailboxId, serviceType),
          isSearching: mailboxState.isSearchingMailbox(mailboxId, serviceType),
          snapshot: mailboxState.getSnapshot(mailboxId, serviceType)
        }
      })
    } else {
      this.setState({ mailbox: null, service: null })
    }
  },

  settingsChanged (settingsState) {
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
  },

  /* **************************************************************************/
  // Public utils
  /* **************************************************************************/

  /**
  * @access: public
  * Pass through to webview.send()
  */
  send () { return this.refs[BROWSER_REF].send.apply(this, Array.from(arguments)) },

  /**
  * @access: public
  * Pass through to webview.sendWithResponse()
  */
  sendWithResponse () { return this.refs[BROWSER_REF].sendWithResponse.apply(this, Array.from(arguments)) },

  /**
  * @access: public
  * @Pass through to webview.loadURL()
  */
  loadURL (url) {
    this.setState({ browserDOMReady: false })
    return this.refs[BROWSER_REF].loadURL(url)
  },

  /**
  * @access public
  * Snapshots a webview
  * @return promise with the nativeImage provided
  */
  captureSnapshot () {
    return new Promise((resolve) => {
      this.refs[BROWSER_REF].getWebContents().capturePage((nativeImage) => {
        resolve(nativeImage)
      })
    })
  },

  /**
  * @return the dom node for the webview
  */
  getWebviewNode () {
    return this.refs[BROWSER_REF].getWebviewNode()
  },

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles the inspector dispatch event
  * @param evt: the event that fired
  */
  handleOpenDevTools (evt) {
    if (evt.mailboxId === this.props.mailboxId) {
      if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].openDevTools()
      } else if (evt.service === this.props.serviceType) {
        this.refs[BROWSER_REF].openDevTools()
      }
    }
  },

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  handleRefocus (evt) {
    if (!evt.mailboxId || !evt.service || (evt.mailboxId === this.props.mailboxId && evt.service === this.props.serviceType)) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  },

  /**
  * Handles reloading the mailbox
  * @param evt: the event that fired
  */
  handleReload (evt) {
    if (evt.mailboxId === this.props.mailboxId) {
      if (evt.allServices) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      } else if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      } else if (evt.service === this.props.serviceType) {
        this.refs[BROWSER_REF].reloadIgnoringCache()
      }
    }
  },

  /**
  * Fetches the webviews process memory info
  * @return promise
  */
  handleFetchProcessMemoryInfo () {
    return this.refs[BROWSER_REF].getProcessMemoryInfo().then((memoryInfo) => {
      return Promise.resolve({
        mailboxId: this.props.mailboxId,
        serviceType: this.props.serviceType,
        memoryInfo: memoryInfo
      })
    })
  },

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
  },

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
      default: break
    }
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady () {
    const { service, language } = this.state

    // Push the settings across
    this.refs[BROWSER_REF].setZoomLevel(service.zoomFactor)

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
  },

  /**
  * Until https://github.com/electron/electron/issues/6958 is fixed we need to
  * be really agressive about setting zoom levels
  */
  handleZoomFixEvent () {
    this.refs[BROWSER_REF].setZoomLevel(this.state.service.zoomFactor)
  },

  /**
  * Updates the target url that the user is hovering over
  * @param evt: the event that fired
  */
  handleBrowserUpdateTargetUrl (evt) {
    this.setState({ focusedUrl: evt.url !== '' ? evt.url : null })
  },

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
  },

  /* **************************************************************************/
  // Browser Events : Focus
  /* **************************************************************************/

  /**
  * Handles a browser focusing
  */
  handleBrowserFocused () {
    mailboxDispatch.focused(this.props.mailboxId, this.props.serviceType)
  },

  /**
  * Handles a browser un-focusing
  */
  handleBrowserBlurred () {
    mailboxDispatch.blurred(this.props.mailboxId, this.props.serviceType)
  },

  /* **************************************************************************/
  // UI Events : Search
  /* **************************************************************************/

  /**
  * Handles the search text changing
  * @param str: the search string
  */
  handleSearchChanged (str) {
    if (str.length) {
      this.refs[BROWSER_REF].findInPage(str)
    } else {
      this.refs[BROWSER_REF].stopFindInPage('clearSelection')
    }
  },

  /**
  * Handles searching for the next occurance
  */
  handleSearchNext (str) {
    if (str.length) {
      this.refs[BROWSER_REF].findInPage(str, { findNext: true })
    }
  },

  /**
  * Handles cancelling searching
  */
  handleSearchCancel () {
    mailboxActions.stopSearchingMailbox(this.props.mailboxId, this.props.serviceType)
    this.refs[BROWSER_REF].stopFindInPage('clearSelection')
  },

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles an ipc search start event coming in
  */
  handleIPCSearchStart () {
    if (this.state.isActive) {
      setTimeout(() => { this.refs[SEARCH_REF].focus() })
    }
  },

  /**
  * Handles an ipc search next event coming in
  */
  handleIPCSearchNext () {
    if (this.state.isActive) {
      this.handleSearchNext(this.refs[SEARCH_REF].searchQuery())
    }
  },

  /**
  * Handles navigating the mailbox back
  */
  handleIPCNavigateBack () {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateBack()
    }
  },

  /**
  * Handles navigating the mailbox forward
  */
  handleIPCNavigateForward () {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateForward()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the app
  */
  render () {
    // Extract our props and pass props
    const { mailbox, service, isActive, focusedUrl, isSearching, url, browserDOMReady, snapshot } = this.state
    if (!mailbox || !service) { return false }
    const { className, preload, ...passProps } = this.props
    delete passProps.serviceType
    delete passProps.mailboxId
    const webviewEventProps = WebView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
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
    const zoomFixFn = service.zoomFactor === 1 ? undefined : this.handleZoomFixEvent

    if (isActive) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }

    return (
      <div className={saltedClassName}>
        <WebView
          ref={BROWSER_REF}
          preload={preload}
          partition={'persist:' + mailbox.partition}
          src={url}

          {...webviewEventProps}

          loadCommit={(evt) => {
            this.multiCallBrowserEvent([zoomFixFn, webviewEventProps.loadCommit], [evt])
          }}
          didGetResponseDetails={(evt) => {
            this.multiCallBrowserEvent([zoomFixFn, webviewEventProps.didGetResponseDetails], [evt])
          }}
          didNavigate={(evt) => {
            this.multiCallBrowserEvent([zoomFixFn, webviewEventProps.didNavigate], [evt])
          }}
          didNavigateInPage={(evt) => {
            this.multiCallBrowserEvent([zoomFixFn, webviewEventProps.didNavigateInPage], [evt])
          }}

          domReady={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserDomReady, webviewEventProps.domReady], [evt])
          }}
          ipcMessage={(evt) => {
            this.multiCallBrowserEvent([this.dispatchBrowserIPCMessage, webviewEventProps.ipcMessage], [evt])
          }}
          willNavigate={(evt) => {
            this.multiCallBrowserEvent([zoomFixFn, this.handleBrowserWillNavigate, webviewEventProps.willNavigate], [evt])
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
        <MailboxSearch
          ref={SEARCH_REF}
          isSearching={isSearching}
          onSearchChange={this.handleSearchChanged}
          onSearchNext={this.handleSearchNext}
          onSearchCancel={this.handleSearchCancel} />
      </div>
    )
  }
})
