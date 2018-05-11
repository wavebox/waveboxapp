import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import { WB_FOCUS_APP, WB_QUIT_APP, WB_TRAY_TOGGLE_WINDOW_MODE } from 'shared/ipcEvents'
import { settingsStore, settingsActions } from 'stores/settings'
import Timeago from 'react-timeago'
import { withStyles } from 'material-ui/styles'
import { Toolbar, IconButton, Icon, Tooltip, Menu, MenuItem, Divider, ListItemIcon } from 'material-ui'
import NotificationIcon from '@material-ui/icons/Notifications'
import classNames from 'classnames'

const styles = {
  notificationMenuItem: {
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: '14px'
  },
  notificationMenuItemIcon: {
    marginRight: 6,
    width: 20,
    height: 20
  },
  notificationMutedInfoMenuItem: {
    fontSize: '12px'
  },
  faIcon: {
    color: 'rgba(255, 255, 255, 0.7)',
    width: 20,
    height: 20,
    fontSize: 20
  },
  faIconStack: {
    width: 20,
    height: 20,
    position: 'relative',
    display: 'inline-block'
  },
  // Open in main window icon
  faIconOpenMainWindow1: {
    position: 'absolute',
    top: 1,
    left: 0,
    width: 20,
    height: 20,
    fontSize: 20
  },
  faIconOpenMainWindow2: {
    position: 'absolute',
    top: 6,
    left: 0,
    fontSize: 11
  },
  spacer: {
    flex: 1
  }
}

@withStyles(styles)
export default class AppSceneToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isWindowedMode: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      notificationsMuted: settingsState.os.notificationsMuted,
      notificationsMutedEndEpoch: settingsState.os.notificationsMutedEndEpoch,
      notificationMenuAnchor: null
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      notificationsMuted: settingsState.os.notificationsMuted,
      notificationsMutedEndEpoch: settingsState.os.notificationsMutedEndEpoch
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Mutes the notification for a certain amount of time
  * @param time: the time to pass to the dispatcher
  */
  muteNotificationsForTime = (time) => {
    this.setState({ notificationMenuAnchor: null })
    // Defer the update slightly so we don't update the menu when it's open
    setTimeout(() => {
      settingsActions.sub.os.muteNotificationsForHours(time)
    }, 500)
  }

  /**
  * Clears the notification mute
  */
  unmuteNotifications = () => {
    this.setState({ notificationMenuAnchor: null })
    // Defer the update slightly so we don't update the menu when it's open
    setTimeout(() => {
      settingsActions.sub.os.clearNotificationMute()
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isWindowedMode, classes, ...passProps } = this.props
    const { notificationsMuted, notificationsMutedEndEpoch, notificationMenuAnchor } = this.state

    return (
      <Toolbar disableGutters {...passProps}>
        <Tooltip title='Compose' placement='top-end'>
          <IconButton onClick={() => emblinkActions.composeNewMessage()}>
            <Icon className={classNames(classes.faIcon, 'far fa-fw fa-edit')} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Show main window' placement='top'>
          <IconButton onClick={() => ipcRenderer.send(WB_FOCUS_APP, {})}>
            <span className={classes.faIconStack}>
              <Icon className={classNames(classes.faIcon, 'far fa-fw fa-browser', classes.faIconOpenMainWindow1)} />
              <Icon className={classNames(classes.faIcon, 'far fa-fw fa-bolt', classes.faIconOpenMainWindow2)} />
            </span>
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isWindowedMode ? 'Dock to tray' : 'Open as window'}
          placement='top'>
          <IconButton onClick={() => ipcRenderer.send(WB_TRAY_TOGGLE_WINDOW_MODE, {})}>
            {isWindowedMode ? (
              process.platform === 'darwin' ? (
                <Icon className={classNames(classes.faIcon, 'far fa-fw fa-arrow-alt-square-up')} />
              ) : (
                <Icon className={classNames(classes.faIcon, 'far fa-fw fa-arrow-alt-square-down')} />
              )
            ) : (
              <Icon className={classNames(classes.faIcon, 'far fa-fw fa-window')} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={notificationsMuted ? (
            <Timeago
              date={notificationsMutedEndEpoch}
              formatter={(value, unit, suffix) => `Notifications muted for ${value} ${unit}${value !== 1 ? 's' : ''}`} />
          ) : (
            `Mute notifications`
          )}
          placement='top'>
          <IconButton onClick={(evt) => this.setState({ notificationMenuAnchor: evt.currentTarget })}>
            <Icon className={classNames(classes.faIcon, 'far fa-fw', notificationsMuted ? 'fa-bell-slash' : 'fa-bell')} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notificationMenuAnchor}
          open={!!notificationMenuAnchor}
          onClose={() => this.setState({ notificationMenuAnchor: null })}>
          <MenuItem className={classes.notificationMenuItem} onClick={() => this.muteNotificationsForTime(0.5)}>
            Mute for 30 minutes
          </MenuItem>
          <MenuItem className={classes.notificationMenuItem} onClick={() => this.muteNotificationsForTime(1)}>
            Mute for 1 hour
          </MenuItem>
          <MenuItem className={classes.notificationMenuItem} onClick={() => this.muteNotificationsForTime(2)}>
            Mute for 2 hours
          </MenuItem>
          <MenuItem className={classes.notificationMenuItem} onClick={() => this.muteNotificationsForTime(6)}>
            Mute for 6 hours
          </MenuItem>
          <MenuItem className={classes.notificationMenuItem} onClick={() => this.muteNotificationsForTime(24)}>
            Mute for 1 day
          </MenuItem>
          {notificationsMuted ? (
            <Divider />
          ) : undefined}
          {notificationsMuted ? (
            <MenuItem className={classes.notificationMenuItem} onClick={this.unmuteNotifications}>
              <ListItemIcon>
                <NotificationIcon className={classes.notificationMenuItemIcon} />
              </ListItemIcon>
              Unmute
            </MenuItem>
          ) : undefined}
          {notificationsMuted ? (
            <MenuItem className={classNames(classes.notificationMenuItem, classes.notificationMutedInfoMenuItem)} disabled>
              <Timeago
                date={notificationsMutedEndEpoch}
                formatter={(value, unit, suffix) => `Notifications muted for ${value} ${unit}${value !== 1 ? 's' : ''}`} />
            </MenuItem>
          ) : undefined}
        </Menu>
        <div className={classes.spacer} />
        <Tooltip title='Quit Wavebox' placement='top-start'>
          <IconButton onClick={() => ipcRenderer.send(WB_QUIT_APP, {})}>
            <Icon className={classNames(classes.faIcon, 'far fa-fw fa-sign-out')} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    )
  }
}
