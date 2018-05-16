import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, SelectField, MenuItem, FlatButton, FontIcon } from 'material-ui' //TODO
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationService } from 'Notifications'
import {
  NOTIFICATION_PROVIDERS,
  NOTIFICATION_SOUNDS
} from 'shared/Notifications'
import { userStore } from 'stores/user'

export default class AccountNotificationSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * @param service: the service to test with
  * @return true if these settings will render for the service
  */
  static willRenderForService (service) {
    return [
      service.supportsNativeNotifications,
      service.supportsGuestNotifications
    ].findIndex((f) => f) !== -1
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      os: settingsState.os,
      userHasSleepable: userStore.getState().user.hasSleepable
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ os: settingsState.os })
  }

  userUpdated = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Sends a test notification
  */
  sendTestNotification = () => {
    const { mailbox, service } = this.props
    const now = new Date()
    NotificationService.processPushedMailboxNotification(mailbox.id, service.type, {
      title: `Testing ${mailbox.displayName}:${service.humanizedType} Notifications`,
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
  * @param service: the service to work on
  * @param os: the os settings
  * @return jsx or undefined
  */
  renderEnhanced (mailbox, service, os) {
    if (os.notificationsProvider !== NOTIFICATION_PROVIDERS.ENHANCED) { return undefined }

    return (
      <div>
        {Object.keys(NOTIFICATION_SOUNDS).length ? (
          <SelectField
            floatingLabelText='Notification Sound'
            value={service.notificationsSound}
            disabled={!service.showNotifications}
            floatingLabelFixed
            fullWidth
            onChange={(evt, index, value) => {
              if (value === null) {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setNotificationsSound, undefined)
              } else {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setNotificationsSound, value)
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
    const { mailbox, service, ...passProps } = this.props
    const { os, userHasSleepable } = this.state
    if (AccountNotificationSettings.willRenderForService(service) === false) { return false }

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Notifications</h1>
        {userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (
          <p style={styles.warningText}>
            <FontIcon className='material-icons' style={styles.warningTextIcon}>warning</FontIcon>
            Notifications will only sync for this service when the account is not sleeping. To
            ensure notifications are always displayed we recommend disabling sleeping for this service
          </p>
        ) : undefined}
        <Toggle
          toggled={service.showNotifications}
          label='Show notifications'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowNotifications, toggled)
          }} />
        {service.supportsNativeNotifications ? (
          <div>
            <Toggle
              toggled={service.showAvatarInNotifications}
              disabled={!service.showNotifications}
              label='Show account icon in Notifications'
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowAvatarInNotifications, toggled)
              }} />
            {this.renderEnhanced(mailbox, service, os)}
            <div>
              <FlatButton
                disabled={!service.showNotifications}
                onClick={this.sendTestNotification}
                label='Test Notification'
                icon={<FontIcon style={{ marginLeft: 0 }} className='material-icons'>play_arrow</FontIcon>}
              />
            </div>
          </div>
        ) : undefined}
      </Paper>
    )
  }
}
