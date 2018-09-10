import PropTypes from 'prop-types'
import React from 'react'
import { accountActions, accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { NotificationService } from 'Notifications'
import { NOTIFICATION_PROVIDERS, NOTIFICATION_SOUNDS } from 'shared/Notifications'
import { userStore } from 'stores/user'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SettingsListItemText from 'wbui/SettingsListItemText'
import WarningIcon from '@material-ui/icons/Warning'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import NotificationsIcon from '@material-ui/icons/Notifications'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'

class ServiceNotificationSection extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.extractStateForService(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasSleepable: userStore.getState().user.hasSleepable,
      osNotificationsProvider: settingsStore.getState().os.notificationsProvider,
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      osNotificationsProvider: settingsState.os.notificationsProvider
    })
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      mailboxId: service.parentId,
      sleepable: service.sleepable,
      supportsSyncWhenSleeping: service.supportsSyncWhenSleeping,
      supportsNativeNotifications: service.supportsNativeNotifications,
      supportsGuestNotifications: service.supportsGuestNotifications,
      showNotifications: service.showNotifications,
      showAvatarInNotifications: service.showAvatarInNotifications,
      notificationsSound: service.notificationsSound,
      displayName: accountState.resolvedServiceDisplayName(serviceId),
      humanizedType: service.humanizedType
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Sends a test notification
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of the service
  * @param displayName: the service display name
  * @param humanizedType: the service humanized type
  */
  sendTestNotification = (mailboxId, serviceId, displayName, humanizedType) => {
    const now = new Date()
    NotificationService.processPushedMailboxNotification(mailboxId, serviceId, {
      title: `Testing ${displayName}:${humanizedType} Notifications`,
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

  render () {
    const {
      serviceId,
      classes,
      ...passProps
    } = this.props
    const {
      userHasSleepable,
      osNotificationsProvider,
      hasService,
      mailboxId,
      sleepable,
      showNotifications,
      supportsSyncWhenSleeping,
      supportsNativeNotifications,
      supportsGuestNotifications,
      showAvatarInNotifications,
      notificationsSound,
      displayName,
      humanizedType
    } = this.state
    if (!hasService) { return false }
    if (!supportsNativeNotifications && !supportsGuestNotifications) { return false }

    const items = [
      (userHasSleepable && sleepable && !supportsSyncWhenSleeping ? (isLast) => {
        return (
          <SettingsListItemText
            key='info'
            divider={!isLast}
            primaryType='warning'
            primaryIcon={<WarningIcon />}
            primary={`Notifications will only sync for this service when the account is not sleeping. To ensure notifications are always displayed we recommend disabling sleeping for this service`} />
        )
      } : undefined),
      (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showNotifications'
            label='Show notifications'
            divider={!isLast}
            checked={showNotifications}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowNotifications, toggled)
            }} />
        )
      },
      (supportsNativeNotifications ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showAvatarInNotifications'
            label='Show account icon in Notifications'
            divider={!isLast}
            disabled={!showNotifications}
            checked={showAvatarInNotifications}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowAvatarInNotifications, toggled)
            }} />
        )
      } : undefined),
      (supportsNativeNotifications && osNotificationsProvider === NOTIFICATION_PROVIDERS.ENHANCED && Object.keys(NOTIFICATION_SOUNDS).length
        ? (isLast) => {
          return (
            <SettingsListItemSelectInline
              key='notificationsSound'
              label='Notification Sound'
              divider={!isLast}
              value={notificationsSound || 'null'}
              disabled={!showNotifications}
              options={[
                { value: 'null', label: 'Default App Sound' }
              ].concat(Object.keys(NOTIFICATION_SOUNDS).map((value) => {
                return { value: value, label: NOTIFICATION_SOUNDS[value] }
              }))}
              onChange={(evt, value) => {
                accountActions.reduceService(
                  serviceId,
                  ServiceReducer.setNotificationsSound,
                  value === 'null' ? undefined : value
                )
              }} />
          )
        }
        : undefined),
      (supportsNativeNotifications ? (isLast) => {
        return (
          <SettingsListItemButton
            key='testNotification'
            divider={!isLast}
            label='Test Notification'
            icon={<PlayArrowIcon />}
            disabled={!showNotifications}
            onClick={() => this.sendTestNotification(mailboxId, serviceId, displayName, humanizedType)} />
        )
      } : undefined)
    ].filter((item) => !!item).map((item, index, arr) => {
      return item(index === (arr.length - 1))
    })
    if (!items.length) { return false }

    return (
      <SettingsListSection title='Notifications' icon={<NotificationsIcon />} {...passProps}>
        {items}
      </SettingsListSection>
    )
  }
}

export default ServiceNotificationSection
