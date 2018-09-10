import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import { remote } from 'electron'
import { IconButton } from '@material-ui/core'
import { CHROME_PDF_URL } from 'shared/constants'
import { URL } from 'url'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import HomeIcon from '@material-ui/icons/Home'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import CloseIcon from '@material-ui/icons/Close'
import RefreshIcon from '@material-ui/icons/Refresh'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
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
    color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'hover')
    },
    '&.is-disabled': {
      color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'disabled'),
      '&:hover': {
        color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.icon.color', 'disabled')
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
    color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.text.color')
  },
  loadingContainer: {
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

@withStyles(styles, { withTheme: true })
class ToolbarNavigation extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired,
    tabId: PropTypes.number,
    mailboxId: PropTypes.string,
    serviceId: PropTypes.string
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
    return {
      ...this.generateFreshState(this.props.tabId)
    }
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
    const { tabId, serviceId } = this.props
    if (tabId === undefined) { return }

    const accountState = accountStore.getState()
    const service = accountState.getService(serviceId)
    if (!service) { return }
    const webContents = remote.webContents.fromId(tabId)
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
      serviceId,
      style,
      theme,
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
        onContextMenu={this.handleOpenPopover}
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
              <Spinner
                size={15}
                color={ThemeTools.getValue(theme, 'wavebox.toolbar.spinner.color')} />
            ) : undefined}
          </div>
        </div>
      </div>
    )
  }
}

export default ToolbarNavigation
