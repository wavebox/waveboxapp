import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import { mailboxStore } from 'stores/mailbox'
import { remote } from 'electron'
import { IconButton, FontIcon, CircularProgress } from 'material-ui'
import { CHROME_PDF_URL } from 'shared/constants'
import url from 'url'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  group: {
    display: 'flex'
  },
  addressGroup: {
    display: 'flex',
    width: '100%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  address: {
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: '14px',
    color: Colors.blueGrey50
  },
  loadingPlaceholder: {
    width: 18,
    height: 18,
    margin: 10
  }
}

export default class ToolbarNavigation extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired,
    tabId: PropTypes.number,
    mailboxId: PropTypes.string,
    serviceType: PropTypes.string
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

    webContents.on('will-navigate', this.handleWillNavigate)
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

    webContents.removeListener('will-navigate', this.handleWillNavigate)
    webContents.removeListener('did-start-loading', this.handleDidStartLoading)
    webContents.removeListener('did-stop-loading', this.handleDidStopLoading)
    webContents.removeListener('did-navigate-in-page', this.handleDidNavigateInPage)
    webContents.removeListener('did-navigate', this.handleDidNavigate)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    return this.generateFreshState(this.props.tabId)
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
  handleWillNavigate = (evt, url) => {
    this.setState({
      currentUrl: url,
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
  onGoHome = () => {
    if (this.props.tabId === undefined) { return }

    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(this.props.serviceType)
    if (!service) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }

    webContents.loadURL(service.url)
  }

  /**
  * Navigates back
  */
  onGoBack = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.goBack()
  }

  /**
  * Navigates forward
  */
  onGoForward = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.goForward()
  }

  /**
  * Stops navigation
  */
  onStop = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.stop()
  }

  /**
  * Reloads current page
  */
  onReload = () => {
    if (this.props.tabId === undefined) { return }
    const webContents = remote.webContents.fromId(this.props.tabId)
    if (!webContents) { return }
    webContents.reload()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Converts a url to a url that can be shown and used externally
  * @param fullUrl: the true url
  * @return the url to load in external browsers and show to the user
  */
  externalUrl (fullUrl) {
    if (!fullUrl) { return fullUrl }
    if (fullUrl.startsWith(CHROME_PDF_URL)) {
      return url.parse(fullUrl, true).query.src
    } else {
      return fullUrl
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      toolbarHeight,
      tabId,
      mailboxId,
      serviceType,
      style,
      ...passProps
    } = this.props
    const {
      isLoading,
      currentUrl,
      canGoBack,
      canGoForward
    } = this.state

    return (
      <div {...passProps} style={{
        ...styles.container,
        height: toolbarHeight,
        ...style
      }}>
        <div style={styles.group}>
          <IconButton
            style={{WebkitAppRegion: 'no-drag'}}
            onClick={this.onGoHome}>
            <FontIcon
              className='material-icons'
              color={Colors.blueGrey100}
              hoverColor={Colors.blueGrey50}>
              home
            </FontIcon>
          </IconButton>
          <IconButton
            style={{WebkitAppRegion: 'no-drag'}}
            disableTouchRipple={!canGoBack}
            onClick={canGoBack ? this.onGoBack : undefined}>
            <FontIcon
              className='material-icons'
              color={canGoBack ? Colors.blueGrey100 : Colors.blueGrey400}
              hoverColor={canGoBack ? Colors.blueGrey50 : Colors.blueGrey400}>
              arrow_back
            </FontIcon>
          </IconButton>
          <IconButton
            style={{WebkitAppRegion: 'no-drag'}}
            disableTouchRipple={!canGoForward}
            onClick={canGoForward ? this.onGoForward : undefined}>
            <FontIcon
              className='material-icons'
              color={canGoForward ? Colors.blueGrey100 : Colors.blueGrey400}
              hoverColor={canGoForward ? Colors.blueGrey50 : Colors.blueGrey400}>
              arrow_forward
            </FontIcon>
          </IconButton>
          <IconButton
            style={{WebkitAppRegion: 'no-drag'}}
            onClick={isLoading ? this.onStop : this.onReload}>
            <FontIcon
              className='material-icons'
              color={Colors.blueGrey100}
              hoverColor={Colors.blueGrey50}>
              {isLoading ? 'close' : 'refresh'}
            </FontIcon>
          </IconButton>
        </div>
        <div style={styles.addressGroup}>
          <div style={styles.address}>
            {this.externalUrl(currentUrl)}
          </div>
        </div>
        <div style={styles.group}>
          {isLoading ? (
            <CircularProgress
              size={18}
              thickness={2}
              color={Colors.cyan200}
              style={{ margin: 10 }} />
          ) : (
            <div style={styles.loadingPlaceholder} />
          )}
        </div>
      </div>
    )
  }
}
