import PropTypes from 'prop-types'
import React from 'react'
import { browserStore, browserActions } from 'stores/browser'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, Toolbar, IconButton, Typography, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { CHROME_PDF_URL } from 'shared/constants'
import { URL } from 'url'
import { remote } from 'electron'
import Spinner from 'wbui/Activity/Spinner'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import CloseIcon from '@material-ui/icons/Close'
import RefreshIcon from '@material-ui/icons/Refresh'
import SearchIcon from '@material-ui/icons/Search'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import ThemeTools from 'wbui/Themes/ThemeTools'
import classNames from 'classnames'
import FASFileDownload from 'wbfa/FASFileDownload'

const styles = (theme) => ({
  toolbar: {
    height: 40,
    minHeight: 40,
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.toolbar.backgroundColor')
  },
  toolbarLoadingIconContainer: {
    width: 40,
    minWidth: 40,
    minHeight: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  toolbarUrl: {
    height: 40,
    lineHeight: '40px',
    width: '100%',
    overflow: 'hidden',
    fontSize: '14px',
    userSelect: 'initial',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: ThemeTools.getStateValue(theme, 'wavebox.toolbar.text.color')
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
  faIcon: {
    fontSize: '18px'
  }
})

@withStyles(styles, { withTheme: true })
class BrowserToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    handleGoBack: PropTypes.func.isRequired,
    handleGoForward: PropTypes.func.isRequired,
    handleStop: PropTypes.func.isRequired,
    handleReload: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    const browserState = browserStore.getState()
    return {
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    })
  }

  /**
  * Converts a url to a url that can be shown and used externally
  * @param url: the true url
  * @return the url to load in external browsers and show to the user
  */
  externalUrl (targetUrl) {
    if (targetUrl.startsWith(CHROME_PDF_URL)) {
      return new URL(targetUrl).searchParams.get('src')
    } else {
      return targetUrl
    }
  }

  /**
  * @param targetUrl: the current url
  * @return true if this url is downloadable
  */
  isDownloadableUrl (targetUrl) {
    if (targetUrl.startsWith(CHROME_PDF_URL)) { return true }

    return false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the current page in the default browser
  */
  handleOpenInBrowser = (evt) => {
    remote.shell.openExternal(this.externalUrl(this.state.currentUrl), { })
  }

  /**
  * Downloads the current page
  */
  handleDownload = (evt) => {
    remote.getCurrentWebContents().downloadURL(this.externalUrl(this.state.currentUrl))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      theme,
      handleGoBack,
      handleGoForward,
      handleStop,
      handleReload,
      ...passProps
    } = this.props
    const { isLoading, currentUrl, canGoBack, canGoForward } = this.state

    return (
      <Paper {...passProps}>
        <Toolbar disableGutters className={classes.toolbar}>
          <IconButton
            disableRipple={!canGoBack}
            onClick={canGoBack ? handleGoBack : undefined}>
            <ArrowBackIcon className={classNames(classes.icon, !canGoBack ? 'is-disabled' : undefined)} />
          </IconButton>
          <IconButton
            disableRipple={!canGoForward}
            onClick={canGoForward ? handleGoForward : undefined}>
            <ArrowForwardIcon className={classNames(classes.icon, !canGoForward ? 'is-disabled' : undefined)} />
          </IconButton>
          <IconButton onClick={isLoading ? handleStop : handleReload}>
            {isLoading ? (
              <CloseIcon className={classes.icon} />
            ) : (
              <RefreshIcon className={classes.icon} />
            )}
          </IconButton>
          <div className={classes.toolbarLoadingIconContainer}>
            {isLoading ? (
              <Spinner
                size={15}
                color={ThemeTools.getValue(theme, 'wavebox.toolbar.spinner.color')} />
            ) : undefined}
          </div>
          <Typography className={classes.toolbarUrl}>
            {this.externalUrl(currentUrl)}
          </Typography>
          <Tooltip title='Find in Page'>
            <IconButton onClick={() => browserActions.toggleSearch()}>
              <SearchIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          {this.isDownloadableUrl(currentUrl) ? (
            <Tooltip title='Download'>
              <IconButton onClick={this.handleDownload}>
                <FASFileDownload className={classNames(classes.icon, classes.faIcon)} />
              </IconButton>
            </Tooltip>
          ) : undefined}
          <Tooltip title='Open in Browser' placement='bottom-start'>
            <IconButton onClick={this.handleOpenInBrowser}>
              <OpenInBrowserIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>
    )
  }
}

export default BrowserToolbar
