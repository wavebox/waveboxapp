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
import FileDownloadIcon from '@material-ui/icons/FileDownload'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import lightBlue from '@material-ui/core/colors/lightBlue'
import grey from '@material-ui/core/colors/grey'

const styles = {
  toolbar: {
    height: 40,
    minHeight: 40,
    backgroundColor: grey[200]
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
    color: 'rgba(0, 0, 0, 0.4)'
  },
  toolbarButton: {
    color: 'rgba(0, 0, 0, 0.87)'
  }
}

@withStyles(styles)
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
    const { classes, handleGoBack, handleGoForward, handleStop, handleReload, ...passProps } = this.props
    const { isLoading, currentUrl, canGoBack, canGoForward } = this.state

    return (
      <Paper {...passProps}>
        <Toolbar disableGutters className={classes.toolbar}>
          <IconButton disabled={!canGoBack} onClick={handleGoBack} className={classes.toolbarButton}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton disabled={!canGoForward} onClick={handleGoForward} className={classes.toolbarButton}>
            <ArrowForwardIcon />
          </IconButton>
          <IconButton onClick={isLoading ? handleStop : handleReload} className={classes.toolbarButton}>
            {isLoading ? (<CloseIcon />) : (<RefreshIcon />)}
          </IconButton>
          <div className={classes.toolbarLoadingIconContainer}>
            {isLoading ? (
              <Spinner size={15} color={lightBlue[600]} />
            ) : undefined}
          </div>
          <Typography className={classes.toolbarUrl}>
            {this.externalUrl(currentUrl)}
          </Typography>
          <Tooltip title='Find in Page'>
            <IconButton onClick={() => browserActions.toggleSearch()} className={classes.toolbarButton}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          {this.isDownloadableUrl(currentUrl) ? (
            <Tooltip title='Download'>
              <IconButton onClick={this.handleDownload} className={classes.toolbarButton}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          ) : undefined}
          <Tooltip title='Open in Browser' placement='bottom-start'>
            <IconButton onClick={this.handleOpenInBrowser} className={classes.toolbarButton}>
              <OpenInBrowserIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>
    )
  }
}

export default BrowserToolbar
