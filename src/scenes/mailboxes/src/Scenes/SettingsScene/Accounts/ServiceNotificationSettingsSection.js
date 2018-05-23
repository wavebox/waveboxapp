import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { NotificationService } from 'Notifications'
import { NOTIFICATION_PROVIDERS, NOTIFICATION_SOUNDS } from 'shared/Notifications'
import { userStore } from 'stores/user'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SettingsListItemText from 'wbui/SettingsListItemText'
import WarningIcon from '@material-ui/icons/Warning'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import NotificationsIcon from '@material-ui/icons/Notifications'

class ServiceNotificationSettingsSection extends React.Component {
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
      <SettingsListItemSelect
        label='Notification Sound'
        value={service.notificationsSound || 'null'}
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
    if (ServiceNotificationSettingsSection.willRenderForService(service) === false) { return false }

    return (
      <SettingsListSection title='Notifications' icon={<NotificationsIcon />} {...passProps}>
        {userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (
          <SettingsListItemText
            primaryType='warning'
            primaryIcon={<WarningIcon />}
            primary={`Notifications will only sync for this service when the account is not sleeping. To ensure notifications are always displayed we recommend disabling sleeping for this service`} />
        ) : undefined}
        <SettingsListItemSwitch
          label='Show notifications'
          divider={service.supportsNativeNotifications}
          onChange={(evt, toggled) => {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowNotifications, toggled)
          }}
          checked={service.showNotifications} />
        {service.supportsNativeNotifications ? (
          <SettingsListItemSwitch
            label='Show account icon in Notifications'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowAvatarInNotifications, toggled)
            }}
            disabled={!service.showNotifications}
            checked={service.showAvatarInNotifications} />
        ) : undefined}
        {service.supportsNativeNotifications ? this.renderEnhanced(mailbox, service, os) : undefined}
        {service.supportsNativeNotifications ? (
          <SettingsListItemButton
            divider={false}
            label='Test Notification'
            icon={<PlayArrowIcon />}
            disabled={!service.showNotifications}
            onClick={this.sendTestNotification} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default ServiceNotificationSettingsSection
