import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import { settingsStore, settingsActions } from 'stores/settings'
import Timeago from 'react-timeago'
import { withStyles } from '@material-ui/core/styles'
import { Toolbar, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from '@material-ui/core'
import NotificationIcon from '@material-ui/icons/Notifications'
import classNames from 'classnames'
import FARCheckSquare from 'wbfa/FARCheckSquare'
import FARSquare from 'wbfa/FARSquare'
import FARBellSlashIcon from 'wbfa/FARBellSlash'
import FARBellIcon from 'wbfa/FARBell'
import FARSignOutIcon from 'wbfa/FARSignOut'
import FARDesktop from 'wbfa/FARDesktop'
import FARPenSquare from 'wbfa/FARPenSquare'
import FARClone from 'wbfa/FARClone'
import FASArrowFromTop from 'wbfa/FASArrowFromTop'
import FASArrowFromBottom from 'wbfa/FASArrowFromBottom'
import AppSceneToolbarButton from './AppSceneToolbarButton'
import {
  WB_FOCUS_APP,
  WB_QUIT_APP,
  WB_TRAY_TOGGLE_WINDOW_MODE,
  WB_TRAY_TOGGLE_ALWAYS_ON_TOP
} from 'shared/ipcEvents'

const styles = {
  // Notification Menu
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
  // Dock Menu
  dockMenuFaIcon: {
    width: 20,
    height: 20,
    fontSize: 20
  },
  // Icons
  faIcon: {
    color: 'rgba(255, 255, 255, 0.7)',
    width: '20px !important',
    height: '20px !important',
    fontSize: '20px !important'
  },
  spacer: {
    flex: 1
  }
}

@withStyles(styles)
class AppSceneToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isWindowedMode: PropTypes.bool.isRequired,
    alwaysOnTop: PropTypes.bool.isRequired
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
      notificationMenuAnchor: null,
      dockMenuAnchor: null
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
    const {
      isWindowedMode,
      alwaysOnTop,
      classes,
      ...passProps
    } = this.props
    const {
      notificationsMuted,
      notificationsMutedEndEpoch,
      notificationMenuAnchor,
      dockMenuAnchor
    } = this.state

    return (
      <Toolbar disableGutters {...passProps}>
        {/* Compose */}
        <AppSceneToolbarButton
          title='Compose'
          placement='top-end'
          onClick={() => emblinkActions.composeNewMessage()}>
          <FARPenSquare className={classes.faIcon} />
        </AppSceneToolbarButton>

        {/* Main Window */}
        <AppSceneToolbarButton
          title='Show main window'
          placement='top'
          onClick={() => ipcRenderer.send(WB_FOCUS_APP, {})}>
          <FARDesktop className={classes.faIcon} />
        </AppSceneToolbarButton>

        {/* Dock */}
        <AppSceneToolbarButton
          title={isWindowedMode ? 'Dock to tray' : 'Open as window'}
          placement='top'
          onClick={() => { ipcRenderer.send(WB_TRAY_TOGGLE_WINDOW_MODE, {}) }}
          onContextMenu={(evt) => this.setState({ dockMenuAnchor: evt.target })}>
          {isWindowedMode ? (
            process.platform === 'darwin' ? (
              <FASArrowFromBottom className={classes.faIcon} />
            ) : (
              <FASArrowFromTop className={classes.faIcon} />
            )
          ) : (
            <FARClone className={classes.faIcon} />
          )}
        </AppSceneToolbarButton>
        <Menu
          open={!!dockMenuAnchor}
          anchorEl={dockMenuAnchor}
          MenuListProps={{ dense: true }}
          disableEnforceFocus
          disableAutoFocusItem
          onClose={() => this.setState({ dockMenuAnchor: null })}>
          <MenuItem onClick={() => {
            this.setState({ dockMenuAnchor: null })
            setTimeout(() => {
              // Use a timeout here other the focus isn't restored correctly
              ipcRenderer.send(WB_TRAY_TOGGLE_WINDOW_MODE, {})
            }, 500)
          }}>
            <ListItemIcon>
              {isWindowedMode ? (
                process.platform === 'darwin' ? (
                  <FASArrowFromBottom className={classes.dockMenuFaIcon} />
                ) : (
                  <FASArrowFromTop className={classes.dockMenuFaIcon} />
                )
              ) : (
                <FARClone className={classes.dockMenuFaIcon} />
              )}
            </ListItemIcon>
            <ListItemText inset primary={isWindowedMode ? 'Dock to tray' : 'Open as window'} />
          </MenuItem>
          {isWindowedMode ? (<Divider />) : undefined}
          {isWindowedMode ? (
            <MenuItem onClick={() => {
              this.setState({ dockMenuAnchor: null })
              setTimeout(() => {
                // Use a timeout here other the focus isn't restored correctly
                ipcRenderer.send(WB_TRAY_TOGGLE_ALWAYS_ON_TOP, {})
              }, 500)
            }}>
              <ListItemIcon>
                {alwaysOnTop ? (
                  <FARCheckSquare className={classes.dockMenuFaIcon} />
                ) : (
                  <FARSquare className={classes.dockMenuFaIcon} />
                )}
              </ListItemIcon>
              <ListItemText inset primary='Keep window on top' />
            </MenuItem>
          ) : undefined}
        </Menu>

        {/* Notifications */}
        <AppSceneToolbarButton
          title={notificationsMuted ? (
            <Timeago
              date={notificationsMutedEndEpoch}
              formatter={(value, unit, suffix) => `Notifications muted for ${value} ${unit}${value !== 1 ? 's' : ''}`} />
          ) : (
            `Mute notifications`
          )}
          placement='top'
          onClick={(evt) => this.setState({ notificationMenuAnchor: evt.currentTarget })}>
          {notificationsMuted ? (
            <FARBellSlashIcon className={classes.faIcon} />
          ) : (
            <FARBellIcon className={classes.faIcon} />
          )}
        </AppSceneToolbarButton>
        <Menu
          disableAutoFocusItem
          disableEnforceFocus
          anchorEl={notificationMenuAnchor}
          open={!!notificationMenuAnchor}
          MenuListProps={{ dense: true }}
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

        {/* Spacer */}
        <div className={classes.spacer} />

        {/* Quit */}
        <AppSceneToolbarButton
          title='Quit Wavebox'
          placement='top-start'
          onClick={() => ipcRenderer.send(WB_QUIT_APP, {})}>
          <FARSignOutIcon className={classes.faIcon} />
        </AppSceneToolbarButton>
      </Toolbar>
    )
  }
}

export default AppSceneToolbar
