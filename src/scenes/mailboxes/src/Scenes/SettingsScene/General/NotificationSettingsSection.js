import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class NotificationSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { os, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Notifications</h1>
        <Toggle
          toggled={os.notificationsEnabled}
          labelPosition='right'
          label='Show new mail/message notifications'
          onToggle={(evt, toggled) => settingsActions.setNotificationsEnabled(toggled)} />
        <Toggle
          toggled={!os.notificationsSilent}
          label='Play notification sound'
          labelPosition='right'
          disabled={!os.notificationsEnabled}
          onToggle={(evt, toggled) => settingsActions.setNotificationsSilent(!toggled)} />
      </Paper>
    )
  }
}
