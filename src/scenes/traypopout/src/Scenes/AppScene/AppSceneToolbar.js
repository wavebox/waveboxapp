import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Toolbar, ToolbarGroup, IconButton, FontIcon, IconMenu, MenuItem, Divider } from 'material-ui'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import { WB_FOCUS_APP, WB_QUIT_APP, WB_TRAY_TOGGLE_WINDOW_MODE } from 'shared/ipcEvents'
import { settingsStore, settingsActions } from 'stores/settings'
import Timeago from 'react-timeago'

const styles = {
  notificationMenuItem: {
    minHeight: 32,
    lineHeight: '32px',
    fontSize: 14
  },
  notificationMutedInfoMenuItem: {
    minHeight: 32,
    lineHeight: '32px',
    fontSize: 12
  },
  faIcon: {
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
    left: 4,
    fontSize: 11
  }
}

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
      notificationsMutedEndEpoch: settingsState.os.notificationsMutedEndEpoch
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
    // Defer the update slightly so we don't update the menu when it's open
    setTimeout(() => {
      settingsActions.sub.os.muteNotificationsForHours(time)
    }, 500)
  }

  /**
  * Clears the notification mute
  */
  unmuteNotifications = () => {
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
    const { isWindowedMode, ...passProps } = this.props
    const { notificationsMuted, notificationsMutedEndEpoch } = this.state

    return (
      <Toolbar {...passProps}>
        <ToolbarGroup firstChild>
          <IconButton
            tooltip='Compose'
            onClick={() => { emblinkActions.composeNewMessage() }}
            tooltipPosition='top-right'
            iconStyle={styles.faIcon}>
            <FontIcon className='far fa-fw fa-edit' color='rgba(255, 255, 255, 0.7)' />
          </IconButton>
          <IconButton
            tooltip='Show main window'
            onClick={() => { ipcRenderer.send(WB_FOCUS_APP, {}) }}
            tooltipPosition='top-center'
            iconStyle={styles.faIconStack}>
            <span>
              <FontIcon
                style={styles.faIconOpenMainWindow1}
                className='far fa-fw fa-browser'
                color='rgba(255, 255, 255, 0.7)' />
              <FontIcon
                style={styles.faIconOpenMainWindow2}
                className='fas fa-fw fa-bolt'
                color='rgba(255, 255, 255, 0.7)' />
            </span>
          </IconButton>
          <IconButton
            tooltip={isWindowedMode ? 'Dock to tray' : 'Open as window'}
            onClick={() => { ipcRenderer.send(WB_TRAY_TOGGLE_WINDOW_MODE, {}) }}
            tooltipPosition='top-center'
            iconStyle={styles.faIcon}>
            {isWindowedMode ? (
              process.platform === 'darwin' ? (
                <FontIcon className='far fa-fw fa-arrow-alt-square-up' color='rgba(255, 255, 255, 0.7)' />
              ) : (
                <FontIcon className='far fa-fw fa-arrow-alt-square-down' color='rgba(255, 255, 255, 0.7)' />
              )
            ) : (
              <FontIcon className='far fa-fw fa-window' color='rgba(255, 255, 255, 0.7)' />
            )}
          </IconButton>
          <IconMenu
            useLayerForClickAway
            iconButtonElement={notificationsMuted ? (
              <IconButton
                tooltip={(
                  <Timeago
                    date={notificationsMutedEndEpoch}
                    formatter={(value, unit, suffix) => {
                      if (value !== 1) { unit += 's' }
                      return 'Notifications muted for ' + value + ' ' + unit
                    }} />
                )}
                tooltipPosition='top-center'
                iconStyle={styles.faIcon}>
                <FontIcon className='far fa-fw fa-bell-slash' color='rgba(255, 255, 255, 0.7)' />
              </IconButton>
            ) : (
              <IconButton
                tooltip={'Mute notifications'}
                tooltipPosition='top-center'
                iconStyle={styles.faIcon}>
                <FontIcon className='far fa-fw fa-bell' color='rgba(255, 255, 255, 0.7)' />
              </IconButton>
            )}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}>
            <MenuItem
              style={styles.notificationMenuItem}
              primaryText='Mute for 30 minutes'
              onClick={() => this.muteNotificationsForTime(0.5)} />
            <MenuItem
              style={styles.notificationMenuItem}
              primaryText='Mute for 1 hour'
              onClick={() => this.muteNotificationsForTime(1)} />
            <MenuItem
              style={styles.notificationMenuItem}
              primaryText='Mute for 2 hours'
              onClick={() => this.muteNotificationsForTime(2)} />
            <MenuItem
              style={styles.notificationMenuItem}
              primaryText='Mute for 6 hours'
              onClick={() => this.muteNotificationsForTime(6)} />
            <MenuItem
              style={styles.notificationMenuItem}
              primaryText='Mute for 1 day'
              onClick={() => this.muteNotificationsForTime(24)} />
            {notificationsMuted ? (
              <Divider />
            ) : undefined}
            {notificationsMuted ? (
              <MenuItem
                style={styles.notificationMenuItem}
                primaryText='Unmute'
                leftIcon={(
                  <FontIcon
                    style={{ margin: '4px 12px' }}
                    size={30}
                    className='material-icons'>
                    notifications
                  </FontIcon>
                )}
                onClick={this.unmuteNotifications} />
            ) : undefined}
            {notificationsMuted ? (
              <MenuItem
                style={styles.notificationMutedInfoMenuItem}
                disabled
                primaryText={(
                  <Timeago
                    date={notificationsMutedEndEpoch}
                    formatter={(value, unit, suffix) => {
                      if (value !== 1) { unit += 's' }
                      return 'Notifications muted for ' + value + ' ' + unit
                    }} />
                )} />
            ) : undefined}
          </IconMenu>
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            tooltip='Quit Wavebox'
            onClick={() => { ipcRenderer.send(WB_QUIT_APP, {}) }}
            tooltipPosition='top-left'
            iconStyle={styles.faIcon}>
            <FontIcon className='far fa-fw fa-sign-out' color='rgba(255, 255, 255, 0.7)' />
          </IconButton>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
