import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore } from 'stores/mailbox'
import { remote } from 'electron'
import { IconButton } from '@material-ui/core'
import { CHROME_PDF_URL } from 'shared/constants'
import { URL } from 'url'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import blueGrey from '@material-ui/core/colors/blueGrey'
import cyan from '@material-ui/core/colors/cyan'
import HomeIcon from '@material-ui/icons/Home'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import CloseIcon from '@material-ui/icons/Close'
import RefreshIcon from '@material-ui/icons/Refresh'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  group: {
    display: 'flex'
  },
  iconButton: {
    WebkitAppRegion: 'no-drag'
  },
  icon: {
    color: blueGrey[100],
    '&:hover': {
      color: blueGrey[50]
    },
    '&.is-disabled': {
      color: blueGrey[400],
      '&:hover': {
        color: blueGrey[50]
      }
    }
  },
  addressGroup: {
    display: 'flex',
    width: '100%',
    textAlign: 'left',
    justifyContent: 'flex-start',
    overflow: 'hidden'
  },
  address: {
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: '14px',
    color: blueGrey[50]
  },
  loadingContainer: {
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

@withStyles(styles)
class ToolbarNavigation extends React.Component {
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
      return new URL(fullUrl).searchParams.get('src')
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
      classes,
      className,
      ...passProps
    } = this.props
    const {
      isLoading,
      currentUrl,
      canGoBack,
      canGoForward
    } = this.state

    return (
      <div
        {...passProps}
        className={classNames(
          classes.container,
          className
        )}
        style={{
          height: toolbarHeight,
          ...style
        }}>
        <div className={classes.group}>
          <IconButton
            className={classes.iconButton}
            onClick={this.onGoHome}>
            <HomeIcon className={classes.icon} />
          </IconButton>
          <IconButton
            className={classes.iconButton}
            disableRipple={!canGoBack}
            onClick={canGoBack ? this.onGoBack : undefined}>
            <ArrowBackIcon className={classNames(classes.icon, !canGoBack ? 'is-disabled' : undefined)} />
          </IconButton>
          <IconButton
            className={classes.iconButton}
            disableRipple={!canGoForward}
            onClick={canGoForward ? this.onGoForward : undefined}>
            <ArrowForwardIcon className={classNames(classes.icon, !canGoForward ? 'is-disabled' : undefined)} />
          </IconButton>
          <IconButton
            className={classes.iconButton}
            onClick={isLoading ? this.onStop : this.onReload}>
            {isLoading ? (
              <CloseIcon className={classes.icon} />
            ) : (
              <RefreshIcon className={classes.icon} />
            )}
          </IconButton>
        </div>
        <div className={classes.addressGroup}>
          <div className={classes.address}>
            {this.externalUrl(currentUrl)}
          </div>
        </div>
        <div className={classes.group}>
          <div className={classes.loadingContainer}>
            {isLoading ? (
              <Spinner size={15} color={cyan[200]} />
            ) : undefined}
          </div>
        </div>
      </div>
    )
  }
}

export default ToolbarNavigation
