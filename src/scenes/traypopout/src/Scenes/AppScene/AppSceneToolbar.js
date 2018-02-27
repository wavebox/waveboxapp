import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Toolbar, ToolbarGroup, IconButton, FontIcon, IconMenu, MenuItem, Divider } from 'material-ui'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import { WB_FOCUS_APP, WB_QUIT_APP } from 'shared/ipcEvents'
import { CTX_MENU_ONLY_SUPPORT } from 'shared/Models/Settings/TraySettings'
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
  }
}

export default class AppSceneToolbar extends React.Component {
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
    const { notificationsMuted, notificationsMutedEndEpoch } = this.state

    return (
      <Toolbar {...this.props}>
        <ToolbarGroup firstChild>
          <IconButton
            tooltip='Compose'
            onClick={() => { emblinkActions.composeNewMessage() }}
            tooltipPosition='top-right'>
            <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>create</FontIcon>
          </IconButton>
          <IconButton
            tooltip='Show main window'
            onClick={() => { ipcRenderer.send(WB_FOCUS_APP, {}) }}
            tooltipPosition='top-center'>
            <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>launch</FontIcon>
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
                tooltipPosition='top-center'>
                <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>notifications_paused</FontIcon>
              </IconButton>
            ) : (
              <IconButton
                tooltip={'Mute notifications'}
                tooltipPosition='top-center'>
                <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>notifications</FontIcon>
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
        {CTX_MENU_ONLY_SUPPORT ? undefined : (
          <ToolbarGroup lastChild>
            <IconButton
              tooltip='Quit Wavebox'
              onClick={() => { ipcRenderer.send(WB_QUIT_APP, {}) }}
              tooltipPosition='top-left'>
              <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>close</FontIcon>
            </IconButton>
          </ToolbarGroup>
        )}
      </Toolbar>
    )
  }
}
