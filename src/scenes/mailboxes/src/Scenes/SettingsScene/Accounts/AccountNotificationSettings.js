import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, SelectField, MenuItem, FlatButton, FontIcon } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationService } from 'Notifications'
import {
  NOTIFICATION_PROVIDERS,
  NOTIFICATION_SOUNDS
} from 'shared/Notifications'

export default class AccountNotificationSettings extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired
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
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      os: settingsState.os
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ os: settingsState.os })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Sends a test notification
  */
  sendTestNotification = () => {
    const { mailbox } = this.props
    const now = new Date()
    NotificationService.processPushedMailboxNotification(mailbox.id, {
      title: `Testing ${mailbox.displayName} Notifications`,
      body: [
        { content: 'Testing Testing 123' },
        { content: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` }
      ]
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the enhanced provider section
  * @param mailbox: the mailbox to work on
  * @param os: the os settings
  * @return jsx or undefined
  */
  renderEnhanced (mailbox, os) {
    if (os.notificationsProvider !== NOTIFICATION_PROVIDERS.ENHANCED) { return undefined }

    return (
      <div>
        {Object.keys(NOTIFICATION_SOUNDS).length ? (
          <SelectField
            floatingLabelText='Notification Sound'
            value={mailbox.notificationsSound}
            disabled={!mailbox.showNotifications}
            floatingLabelFixed
            fullWidth
            onChange={(evt, index, value) => {
              if (value === null) {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setNotificationsSound, undefined)
              } else {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setNotificationsSound, value)
              }
            }}>
            <MenuItem key='__parent__' value={null} primaryText='' />
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
    const { mailbox, ...passProps } = this.props
    const { os } = this.state

    if (!mailbox.supportsNativeNotifications) { return false }

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Notifications</h1>
        <Toggle
          toggled={mailbox.showNotifications}
          label='Show notifications'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setShowNotifications, toggled)
          }} />
        <Toggle
          toggled={mailbox.showAvatarInNotifications}
          disabled={!mailbox.showNotifications}
          label='Show account icon in Notifications'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setShowAvatarInNotifications, toggled)
          }} />
        {this.renderEnhanced(mailbox, os)}
        <div>
          <FlatButton
            disabled={!mailbox.showNotifications}
            onClick={this.sendTestNotification}
            label='Test Notification'
            icon={<FontIcon style={{ marginLeft: 0 }} className='material-icons'>play_arrow</FontIcon>}
          />
        </div>
      </Paper>
    )
  }
}
