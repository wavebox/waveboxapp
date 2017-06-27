import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import {
  Paper, IconButton, FontIcon, CircularProgress,
  Toolbar, ToolbarGroup, ToolbarTitle
} from 'material-ui'
import { CHROME_PDF_URL } from 'shared/constants'
import URI from 'urijs'

export default class MailboxNavigationToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    handleGoHome: PropTypes.func.isRequired,
    handleGoBack: PropTypes.func.isRequired,
    handleGoForward: PropTypes.func.isRequired,
    handleStop: PropTypes.func.isRequired,
    handleReload: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * A quite non-react way to update the state
  * @param updates: an object containing some or all of the following keys:
  *                     canGoBack: true if the browser can go back
  *                     canGoForward: true if the browser can go forward
  *                     isLoading: true if the browser is loading
  *                     currentUrl: the current url
  */
  updateBrowserState = (updates) => {
    this.setState(updates)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    return {
      isLoading: false,
      currentUrl: '',
      canGoBack: false,
      canGoForward: false
    }
  })()

  /**
  * Converts a url to a url that can be shown and used externally
  * @param url: the true url
  * @return the url to load in external browsers and show to the user
  */
  externalUrl (url) {
    if (url.startsWith(CHROME_PDF_URL)) {
      return URI(url).search(true).src
    } else {
      return url
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, handleGoHome, handleGoBack, handleGoForward, handleStop, handleReload, ...passProps } = this.props
    const { isLoading, currentUrl, canGoBack, canGoForward } = this.state

    const fullClassName = [
      'ReactComponent-MailboxNavigationToolbar',
      className
    ].filter((c) => !!c).join(' ')

    return (
      <Paper {...passProps} className={fullClassName}>
        <Toolbar style={{ height: 40, backgroundColor: Colors.blueGrey900 }}>
          <ToolbarGroup firstChild>
            <IconButton
              style={{WebkitAppRegion: 'no-drag'}}
              onClick={handleGoHome}>
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
              onClick={canGoBack ? handleGoBack : undefined}>
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
              onClick={canGoForward ? handleGoForward : undefined}>
              <FontIcon
                className='material-icons'
                color={canGoForward ? Colors.blueGrey100 : Colors.blueGrey400}
                hoverColor={canGoForward ? Colors.blueGrey50 : Colors.blueGrey400}>
                arrow_forward
              </FontIcon>
            </IconButton>
            <IconButton
              style={{WebkitAppRegion: 'no-drag'}}
              onClick={isLoading ? handleStop : handleReload}>
              <FontIcon
                className='material-icons'
                color={Colors.blueGrey100}
                hoverColor={Colors.blueGrey50}>
                {isLoading ? 'close' : 'refresh'}
              </FontIcon>
            </IconButton>
          </ToolbarGroup>
          <ToolbarGroup style={{ minWidth: 0 }}>
            <ToolbarTitle
              text={this.externalUrl(currentUrl)}
              style={{ fontSize: '14px', color: Colors.blueGrey50 }} />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            {isLoading ? (
              <CircularProgress
                size={18}
                thickness={2}
                color={Colors.cyan200}
                style={{ margin: 10 }} />
            ) : (
              <div style={{ width: 18, height: 18, margin: 10 }} />
            )}
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    )
  }
}
