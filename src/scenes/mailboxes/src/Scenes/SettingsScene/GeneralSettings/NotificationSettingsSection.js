import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, FlatButton, FontIcon, IconMenu, Divider } from 'material-ui'
import Timeago from 'react-timeago'
import settingsActions from 'stores/settings/settingsActions'
import commonStyles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationPlatformSupport, NotificationService } from 'Notifications'
import {
  NOTIFICATION_PROVIDERS,
  NOTIFICATION_SOUNDS
} from 'shared/Notifications'

const styles = {
  buttonIcon: {
    marginLeft: 0
  },
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

export default class NotificationSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired
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

    return (
      <div>
        {Object.keys(NOTIFICATION_SOUNDS).length ? (
          <SelectField
            floatingLabelText='Notification Sound'
            value={os.notificationsSound}
            disabled={os.notificationsSilent || !os.notificationsEnabled}
            fullWidth
            onChange={(evt, index, value) => { settingsActions.sub.os.setNotificationsSound(value) }}>
            {Object.keys(NOTIFICATION_SOUNDS).map((value) => {
              return (
                <MenuItem
                  key={value}
                  value={value}
                  primaryText={NOTIFICATION_SOUNDS[value]} />
              )
            })}
          </SelectField>
        ) : undefined}
      </div>
    )
  }

  /**
  * Renders the mute section
  * @param os: the os settings
  * @return jsx
  */
  renderMute (os) {
    return (
      <div>
        <IconMenu
          iconButtonElement={os.notificationsMuted ? (
            <FlatButton
              icon={<FontIcon style={styles.buttonIcon} className='material-icons'>notifications_paused</FontIcon>}
              label='Notifications muted' />
          ) : (
            <FlatButton
              icon={<FontIcon style={styles.buttonIcon} className='material-icons'>notifications</FontIcon>}
              label='Mute notifications' />
          )}
          anchorOrigin={{horizontal: 'left', vertical: 'top'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}>
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
          {os.notificationsMuted ? (
            <Divider />
          ) : undefined}
          {os.notificationsMuted ? (
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
          {os.notificationsMuted ? (
            <MenuItem
              style={styles.notificationMutedInfoMenuItem}
              disabled
              primaryText={(
                <Timeago
                  date={os.notificationsMutedEndEpoch}
                  formatter={(value, unit, suffix) => {
                    if (value !== 1) { unit += 's' }
                    return 'Notifications muted for ' + value + ' ' + unit
                  }} />
              )} />
          ) : undefined}
        </IconMenu>
      </div>
    )
  }

  render () {
    const { os, ...passProps } = this.props

    const validProviders = Object.keys(NOTIFICATION_PROVIDERS)
      .filter((provider) => NotificationPlatformSupport.supportsProvider(provider))

    return (
      <Paper zDepth={1} style={commonStyles.paper} {...passProps}>
        <h1 style={commonStyles.subheading}>Notifications</h1>
        {validProviders.length > 1 ? (
          <SelectField
            floatingLabelText='Notification Provider'
            value={os.notificationsProvider}
            fullWidth
            onChange={(evt, index, value) => { settingsActions.sub.os.setNotificationsProvider(value) }}>
            {validProviders.map((provider) => {
              return (
                <MenuItem
                  key={provider}
                  value={provider}
                  label={this.humanizeProvider(provider)}
                  primaryText={`${this.humanizeProvider(provider)}: ${this.providerHelpText(provider)}`} />
              )
            })}
          </SelectField>
        ) : undefined}
        <Toggle
          toggled={os.notificationsEnabled}
          labelPosition='right'
          label='Show new mail/message notifications'
          onToggle={(evt, toggled) => settingsActions.sub.os.setNotificationsEnabled(toggled)} />
        <Toggle
          toggled={!os.notificationsSilent}
          label='Play notification sound'
          labelPosition='right'
          disabled={!os.notificationsEnabled}
          onToggle={(evt, toggled) => settingsActions.sub.os.setNotificationsSilent(!toggled)} />
        {this.renderEnhanced(os)}
        {this.renderMute(os)}
        <div>
          <FlatButton
            disabled={!os.notificationsEnabled}
            onClick={this.sendTestNotification}
            label='Test Notification'
            icon={<FontIcon style={styles.buttonIcon} className='material-icons'>play_arrow</FontIcon>}
          />
        </div>
      </Paper>
    )
  }
}
