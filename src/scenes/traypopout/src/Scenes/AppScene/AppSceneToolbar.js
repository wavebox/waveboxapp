import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import { WB_FOCUS_APP, WB_QUIT_APP, WB_TRAY_TOGGLE_WINDOW_MODE } from 'shared/ipcEvents'
import { settingsStore, settingsActions } from 'stores/settings'
import Timeago from 'react-timeago'
import { withStyles } from '@material-ui/core/styles'
import { Toolbar, Menu, MenuItem, Divider, ListItemIcon } from '@material-ui/core'
import NotificationIcon from '@material-ui/icons/Notifications'
import classNames from 'classnames'
import FAREditIcon from 'wbfa/FAREdit'
import FARBrowserIcon from 'wbfa/FARBrowser'
import FARBoltIcon from 'wbfa/FARBolt'
import FARArrowAltSquareUpIcon from 'wbfa/FARArrowAltSquareUp'
import FARArrowAltSquareDownIcon from 'wbfa/FARArrowAltSquareDown'
import FARWindowIcon from 'wbfa/FARWindow'
import FARBellSlashIcon from 'wbfa/FARBellSlash'
import FARBellIcon from 'wbfa/FARBell'
import FARSignOutIcon from 'wbfa/FARSignOut'
import AppSceneToolbarButton from './AppSceneToolbarButton'

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
    top: 2,
    left: 7,
    fontSize: 11
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
        <AppSceneToolbarButton
          title='Compose'
          placement='top-end'
          onClick={() => emblinkActions.composeNewMessage()}>
          <FAREditIcon className={classes.faIcon} />
        </AppSceneToolbarButton>
        <AppSceneToolbarButton
          title='Show main window'
          placement='top'
          onClick={() => ipcRenderer.send(WB_FOCUS_APP, {})}>
          <span className={classes.faIconStack}>
            <FARBrowserIcon className={classNames(classes.faIcon, classes.faIconOpenMainWindow1)} />
            <FARBoltIcon className={classNames(classes.faIcon, classes.faIconOpenMainWindow2)} />
          </span>
        </AppSceneToolbarButton>
        <AppSceneToolbarButton
          title={isWindowedMode ? 'Dock to tray' : 'Open as window'}
          placement='top'
          onClick={() => { ipcRenderer.send(WB_TRAY_TOGGLE_WINDOW_MODE, {}) }}>
          {isWindowedMode ? (
            process.platform === 'darwin' ? (
              <FARArrowAltSquareUpIcon className={classes.faIcon} />
            ) : (
              <FARArrowAltSquareDownIcon className={classes.faIcon} />
            )
          ) : (
            <FARWindowIcon className={classes.faIcon} />
          )}
        </AppSceneToolbarButton>
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
