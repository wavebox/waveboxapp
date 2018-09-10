import PropTypes from 'prop-types'
import React from 'react'
import Timeago from 'react-timeago'
import settingsActions from 'stores/settings/settingsActions'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import { NotificationPlatformSupport, NotificationService } from 'Notifications'
import { MenuItem, Menu, ListItemIcon, Divider } from '@material-ui/core'
import {
  NOTIFICATION_PROVIDERS,
  NOTIFICATION_SOUNDS
} from 'shared/Notifications'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import { withStyles } from '@material-ui/core/styles'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import NotificationsIcon from '@material-ui/icons/Notifications'
import NotificationsPausedIcon from '@material-ui/icons/NotificationsPaused'
import classNames from 'classnames'
import SettingsListItemButton from 'wbui/SettingsListItemButton'

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
  }
}

@withStyles(styles)
class NotificationSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    notificationMenuAnchor: null
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Sends a test notification
  */
  sendTestNotification = () => {
    const now = new Date()
    NotificationService.processTestNotification(
      `Testing Notifications`,
      [
        'Testing Testing 123',
        `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      ].join('\n')
    )
  }

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
    return (
      modelCompare(this.props.os, nextProps.os, [
        'notificationsProvider',
        'notificationsSound',
        'notificationsSilent',
        'notificationsEnabled',
        'notificationsMuted',
        'notificationsMutedEndEpoch'
      ]) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  /**
  * @param provider: the provider type
  * @return a humanized version of the provider
  */
  humanizeProvider (provider) {
    switch (provider) {
      case NOTIFICATION_PROVIDERS.ELECTRON: return 'Default'
      case NOTIFICATION_PROVIDERS.ENHANCED: return 'Enhanced (Experimental)'
      default: return provider
    }
  }

  /**
  * @param provider: the provider type
  * @return some help text about the provider
  */
  providerHelpText (provider) {
    switch (provider) {
      case NOTIFICATION_PROVIDERS.ELECTRON:
        return 'Best for cross platform support'
      case NOTIFICATION_PROVIDERS.ENHANCED:
        return 'Best for features'
      default: return undefined
    }
  }

  /**
  * Renders the enhanced provider section
  * @param os: the os settings
  * @return jsx or undefined
  */
  renderEnhanced (os) {
    if (os.notificationsProvider !== NOTIFICATION_PROVIDERS.ENHANCED) { return undefined }
    if (Object.keys(NOTIFICATION_SOUNDS).length === 0) { return undefined }

    return (
      <SettingsListItemSelectInline
        label='Notification Sound'
        value={os.notificationsSound}
        disabled={os.notificationsSilent || !os.notificationsEnabled}
        options={Object.keys(NOTIFICATION_SOUNDS).map((value) => {
          return { value: value, label: NOTIFICATION_SOUNDS[value] }
        })}
        onChange={(evt, value) => settingsActions.sub.os.setNotificationsSound(value)} />
    )
  }

  /**
  * Renders the mute section
  * @param os: the os settings
  * @return jsx
  */
  renderMute (classes, os) {
    const { notificationMenuAnchor } = this.state
    return (
      <SettingsListItemButton
        label={os.notificationsMuted ? 'Notifications muted' : 'Mute notifications'}
        icon={os.notificationsMuted ? (<NotificationsPausedIcon />) : (<NotificationsIcon />)}
        onClick={(evt) => { this.setState({ notificationMenuAnchor: evt.target }) }}>
        <Menu
          disableEnforceFocus
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
          {os.notificationsMuted ? (
            <Divider />
          ) : undefined}
          {os.notificationsMuted ? (
            <MenuItem className={classes.notificationMenuItem} onClick={this.unmuteNotifications}>
              <ListItemIcon>
                <NotificationsIcon className={classes.notificationMenuItemIcon} />
              </ListItemIcon>
              Unmute
            </MenuItem>
          ) : undefined}
          {os.notificationsMuted ? (
            <MenuItem className={classNames(classes.notificationMenuItem, classes.notificationMutedInfoMenuItem)} disabled>
              <Timeago
                date={os.notificationsMutedEndEpoch}
                formatter={(value, unit, suffix) => `Notifications muted for ${value} ${unit}${value !== 1 ? 's' : ''}`} />
            </MenuItem>
          ) : undefined}
        </Menu>
      </SettingsListItemButton>
    )
  }

  render () {
    const { os, classes, ...passProps } = this.props

    const validProviders = Object.keys(NOTIFICATION_PROVIDERS)
      .filter((provider) => NotificationPlatformSupport.supportsProvider(provider))

    return (
      <SettingsListSection title='Notifications' icon={<NotificationsIcon />} {...passProps}>
        {validProviders.length > 1 ? (
          <SettingsListItemSelectInline
            label='Notification Provider'
            value={os.notificationsProvider}
            options={validProviders.map((provider) => {
              return {
                value: provider,
                label: this.humanizeProvider(provider),
                primaryText: `${this.humanizeProvider(provider)}: ${this.providerHelpText(provider)}`
              }
            })}
            onChange={(evt, value) => settingsActions.sub.os.setNotificationsProvider(value)} />
        ) : undefined}
        <SettingsListItemSwitch
          label='Show new mail/message notifications'
          onChange={(evt, toggled) => settingsActions.sub.os.setNotificationsEnabled(toggled)}
          checked={os.notificationsEnabled} />
        <SettingsListItemSwitch
          label='Play notification sound'
          onChange={(evt, toggled) => settingsActions.sub.os.setNotificationsSilent(!toggled)}
          disabled={!os.notificationsEnabled}
          checked={!os.notificationsSilent} />
        {this.renderEnhanced(os)}
        {this.renderMute(classes, os)}
        <SettingsListItemButton
          divider={false}
          label='Test Notification'
          icon={<PlayArrowIcon />}
          onClick={this.sendTestNotification} />
      </SettingsListSection>
    )
  }
}

export default NotificationSettingsSection
