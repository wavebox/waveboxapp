import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceInformationCover from '../ServiceInformationCover'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Refresh'
import WifiOffIcon from '@material-ui/icons/WifiOff'
import FARFrown from 'wbfa/FARFrown'
import FARServer from 'wbfa/FARServer'

// https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const HANDLED_ERROR_CODES = new Set([
  -2, // FAILED
  -100, // CONNECTION_CLOSED
  -101, // CONNECTION_RESET
  -102, // CONNECTION_REFUSED
  -105, // ERR_NAME_NOT_RESOLVED
  -106 // ERR_INTERNET_DISCONNECTED
])

const styles = {
  infoButtonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceLoadErrorCover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    attemptReload: PropTypes.func.isRequired,
    loadError: PropTypes.shape({
      code: PropTypes.oneOf(Array.from(HANDLED_ERROR_CODES)).isRequired,
      description: PropTypes.string.isRequired,
      url: PropTypes.string
    })
  }

  static get HANDLED_ERROR_CODES () { return HANDLED_ERROR_CODES }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param code: the error code
  * @return icon component
  */
  renderIconComponent (code) {
    switch (code) {
      case -2: return FARFrown
      case -100: return FARServer
      case -101: return FARServer
      case -102: return FARServer
      case -105: return FARFrown
      case -106: return WifiOffIcon
    }
  }

  /**
  * @param code: the error code
  * @return error title
  */
  renderTitle (code) {
    switch (code) {
      case -2: return `Failed to connect`
      case -100: return `Connection closed`
      case -101: return `Failed to connect`
      case -102: return `This site can't be reached`
      case -105: return `This site can't be reached`
      case -106: return `No internet`
    }
  }

  /**
  * @param code: the error code
  * @param description: the error description
  * @param url: the url that errored
  * @return error text
  */
  renderText (code, description, url) {
    switch (code) {
      case -2: return [
        'Try checking your internet connection and proxy settings',
        '',
        description
      ]
      case -100: return [
        'The connection was closed when connecting to the server:',
        url,
        '',
        description
      ]
      case -101: return [
        'The connection was reset when connecting to the server:',
        url,
        '',
        description
      ]
      case -102: return [
        'Refused to connect to the server:',
        url,
        '',
        description
      ]
      case -105: return [
        'There server IP address could not be found for:',
        url,
        '',
        description
      ]
      case -106: return [
        'Try checking your internet connection',
        '',
        description
      ]
    }
  }

  /**
  * @param classes: the css classes
  * @param code: the error code
  * @param attemptReload: the reload function
  * @return jsx
  */
  renderButton (classes, code, attemptReload) {
    switch (code) {
      case -102:
      case -105:
        return undefined

      case -2:
      case -100:
      case -101:
      case -106:
        return (
          <Button variant='contained' onClick={attemptReload}>
            <RefreshIcon className={classes.infoButtonIcon} />
            Reload
          </Button>
        )
    }
  }

  render () {
    const { attemptReload, loadError, classes, ...passProps } = this.props

    if (loadError) {
      return (
        <ServiceInformationCover
          {...passProps}
          IconComponent={this.renderIconComponent(loadError.code)}
          title={this.renderTitle(loadError.code)}
          text={this.renderText(loadError.code, loadError.description, loadError.validatedURL || loadError.url)}
          button={this.renderButton(classes, loadError.code, attemptReload)} />
      )
    } else {
      return false
    }
  }
}

export default ServiceLoadErrorCover
