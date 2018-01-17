import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, FlatButton, FontIcon } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationPlatformSupport, NotificationService } from 'Notifications'
import {
  NOTIFICATION_PROVIDERS,
  NOTIFICATION_SOUNDS
} from 'shared/Notifications'

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

  render () {
    const { os, ...passProps } = this.props

    const validProviders = Object.keys(NOTIFICATION_PROVIDERS)
      .filter((provider) => NotificationPlatformSupport.supportsProvider(provider))

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Notifications</h1>
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
        <div>
          <FlatButton
            disabled={!os.notificationsEnabled}
            onClick={this.sendTestNotification}
            label='Test Notification'
            icon={<FontIcon style={{ marginLeft: 0 }} className='material-icons'>play_arrow</FontIcon>}
          />
        </div>
      </Paper>
    )
  }
}
