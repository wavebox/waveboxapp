import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationService } from 'Notifications'
import { NOTIFICATION_PROVIDERS, NOTIFICATION_SOUNDS } from 'shared/Notifications'
import { userStore } from 'stores/user'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListSelect from 'wbui/SettingsListSelect'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListButton from 'wbui/SettingsListButton'
import { withStyles } from '@material-ui/core/styles'
import amber from '@material-ui/core/colors/amber'
import { ListItemText } from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'

const styles = {
  warningText: {
    color: amber[700],
    fontSize: 14,
    fontWeight: 300
  },
  warningTextIcon: {
    color: amber[700],
    fontSize: 18,
    marginRight: 4,
    verticalAlign: 'top'
  }
}

@withStyles(styles)
class AccountNotificationSettings extends React.Component {
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
    if (!Object.keys(NOTIFICATION_SOUNDS).length) { return undefined }

    return (
      <SettingsListSelect
        label='Notification Sound'
        value={service.notificationsSound}
        disabled={!service.showNotifications}
        options={[
          { value: 'null', label: '' }
        ].concat(Object.keys(NOTIFICATION_SOUNDS).map((value) => {
          return { value: value, label: NOTIFICATION_SOUNDS[value] }
        }))}
        onChange={(evt, value) => {
          if (value === 'null') {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setNotificationsSound, undefined)
          } else {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setNotificationsSound, value)
          }
        }} />
    )
  }

  render () {
    const { mailbox, service, classes, ...passProps } = this.props
    const { os, userHasSleepable } = this.state
    if (AccountNotificationSettings.willRenderForService(service) === false) { return false }

    return (
      <SettingsListSection title='Notifications' {...passProps}>
        {userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (
          <SettingsListItem>
            <ListItemText primary={(
              <span className={classes.warningText}>
                <WarningIcon className={classes.warningTextIcon} />
                Notifications will only sync for this service when the account is not sleeping. To
                ensure notifications are always displayed we recommend disabling sleeping for this service
              </span>
            )} />
          </SettingsListItem>
        ) : undefined}
        <SettingsListSwitch
          label='Show notifications'
          onChange={(evt, toggled) => {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowNotifications, toggled)
          }}
          checked={service.showNotification} />
        {service.supportsNativeNotifications ? (
          <SettingsListSwitch
            label='Show account icon in Notifications'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowAvatarInNotifications, toggled)
            }}
            disabled={!service.showNotifications}
            checked={service.showAvatarInNotifications} />
        ) : undefined}
        {service.supportsNativeNotifications ? this.renderEnhanced(mailbox, service, os) : undefined}
        {service.supportsNativeNotifications ? (
          <SettingsListButton
            label='Test Notification'
            IconClass={PlayArrowIcon}
            disabled={!service.showNotifications}
            onClick={this.sendTestNotification} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default AccountNotificationSettings
