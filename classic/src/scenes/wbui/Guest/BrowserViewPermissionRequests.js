import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'
import { Button, Paper } from '@material-ui/core'
import { URL } from 'url'
import MyLocationIcon from '@material-ui/icons/MyLocation'
import PermCameraMicIcon from '@material-ui/icons/PermCameraMic'
import HelpIcon from '@material-ui/icons/Help'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: 300,
    maxWidth: 500,
    width: 'auto',
    height: 'auto',
    padding: '6px 24px'
  },
  icon: {
    marginRight: 6,
    fontSize: '20px',
    verticalAlign: 'bottom'
  },
  permission: {
    fontSize: '12px'
  },
  actions: {
    textAlign: 'right'
  },
  actionButton: {
    margin: 8
  }
}

@withStyles(styles)
class BrowserViewPermissionRequests extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    permissionRequests: PropTypes.array.isRequired,
    url: PropTypes.string,
    onResolvePermission: PropTypes.func
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the request element
  * @param classes: the classes to use
  * @param permissionType: the type of permission
  * @return jsx
  */
  renderRequestType (classes, permissionType) {
    if (permissionType === 'geolocation') {
      return (
        <p className={classes.permission}>
          <MyLocationIcon className={classes.icon} />
          Know your location
        </p>
      )
    } else if (permissionType === 'media') {
      return (
        <p className={classes.permission}>
          <PermCameraMicIcon className={classes.icon} />
          Use your microphone and/or camera
        </p>
      )
    } else {
      // If it's not known just give the most basic info we have
      return (
        <p className={classes.permission}>
          <HelpIcon className={classes.icon} />
          {permissionType}
        </p>
      )
    }
  }

  render () {
    const {
      permissionRequests,
      url,
      onResolvePermission,
      className,
      classes,
      ...passProps
    } = this.props
    const permissionType = permissionRequests[0]

    if (permissionType) {
      const purl = url ? new URL(url) : undefined
      return (
        <Paper className={classNames(className, classes.root)} elevation={10} {...passProps}>
          <p>
            {purl ? `${purl.protocol}//${purl.hostname}` : 'This site'} wants to:
          </p>
          {this.renderRequestType(classes, permissionType)}
          <div className={classes.actions}>
            <Button
              className={classes.actionButton}
              variant='outlined'
              onClick={() => { if (onResolvePermission) { onResolvePermission(permissionType, 'default') } }}>
              Later
            </Button>
            <Button
              className={classes.actionButton}
              variant='outlined'
              color='primary'
              onClick={() => { if (onResolvePermission) { onResolvePermission(permissionType, 'denied') } }}>
              Block
            </Button>
            <Button
              className={classes.actionButton}
              variant='outlined'
              color='primary'
              onClick={() => { if (onResolvePermission) { onResolvePermission(permissionType, 'granted') } }}>
              Allow
            </Button>
          </div>
        </Paper>
      )
    } else {
      return false
    }
  }
}

export default BrowserViewPermissionRequests
