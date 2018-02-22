import PropTypes from 'prop-types'
import React from 'react'
import { browserStore, browserActions } from 'stores/browser'
import shallowCompare from 'react-addons-shallow-compare'
import {
  Paper, IconButton, FontIcon,
  Toolbar, ToolbarGroup, ToolbarTitle
} from 'material-ui'
import { CHROME_PDF_URL } from 'shared/constants'
import url from 'url'
import { remote } from 'electron'
import * as Colors from 'material-ui/styles/colors'
import Spinner from 'sharedui/Components/Activity/Spinner'

export default class BrowserToolbar extends React.Component {
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
      return url.parse(targetUrl, true).query.src
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
    const { className, handleGoBack, handleGoForward, handleStop, handleReload, ...passProps } = this.props
    const { isLoading, currentUrl, canGoBack, canGoForward } = this.state

    const fullClassName = [
      'ReactComponent-BrowserToolbar',
      className
    ].filter((c) => !!c).join(' ')

    return (
      <Paper {...passProps} className={fullClassName}>
        <Toolbar style={{ height: 40 }}>
          <ToolbarGroup firstChild>
            <IconButton
              disabled={!canGoBack}
              onClick={handleGoBack}>
              <FontIcon className='material-icons'>arrow_back</FontIcon>
            </IconButton>
            <IconButton
              disabled={!canGoForward}
              onClick={handleGoForward}>
              <FontIcon className='material-icons'>arrow_forward</FontIcon>
            </IconButton>
            <IconButton onClick={isLoading ? handleStop : handleReload}>
              <FontIcon className='material-icons'>{isLoading ? 'close' : 'refresh'}</FontIcon>
            </IconButton>
            <div style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isLoading ? (
                <Spinner size={15} color={Colors.lightBlue600} />
              ) : undefined}
            </div>
          </ToolbarGroup>
          <ToolbarGroup style={{ minWidth: 0, width: '100%' }}>
            <ToolbarTitle
              text={this.externalUrl(currentUrl)}
              style={{ fontSize: '14px', userSelect: 'initial' }} />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <IconButton
              tooltip='Find in Page'
              onClick={() => browserActions.toggleSearch()}>
              <FontIcon className='material-icons'>search</FontIcon>
            </IconButton>
            {this.isDownloadableUrl(currentUrl) ? (
              <IconButton
                tooltip='Download'
                onClick={this.handleDownload}>
                <FontIcon className='material-icons'>file_download</FontIcon>
              </IconButton>
            ) : undefined}
            <IconButton
              tooltip='Open in Browser'
              tooltipPosition='bottom-left'
              onClick={this.handleOpenInBrowser}>
              <FontIcon className='material-icons'>open_in_browser</FontIcon>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    )
  }
}
