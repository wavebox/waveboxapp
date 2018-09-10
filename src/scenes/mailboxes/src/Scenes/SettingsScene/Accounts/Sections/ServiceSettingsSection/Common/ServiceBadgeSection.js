import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemText from 'wbui/SettingsListItemText'
import WarningIcon from '@material-ui/icons/Warning'
import SmsIcon from '@material-ui/icons/Sms'
import AdjustIcon from '@material-ui/icons/Adjust'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import SettingsListItemColorPicker from 'wbui/SettingsListItemColorPicker'

const styles = {
  mockUnreadActivityIndicator: {
    backgroundColor: red[400],
    color: 'white',
    display: 'inline-block',
    borderRadius: '50%',
    width: 15,
    height: 15,
    lineHeight: '15px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '10px',
    paddingRight: 1
  }
}

@withStyles(styles)
class ServiceBadgeSection extends React.Component {
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
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
    accountStore.unlisten(this.accountChanged)
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

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      sleepable: service.sleepable,
      supportsSyncWhenSleeping: service.supportsSyncWhenSleeping,
      supportsUnreadCount: service.supportsUnreadCount,
      supportsUnreadActivity: service.supportsUnreadActivity,
      badgeColor: service.badgeColor,
      showBadgeCount: service.showBadgeCount,
      showBadgeCountInApp: service.showBadgeCountInApp,
      showBadgeActivity: service.showBadgeActivity,
      showBadgeActivityInApp: service.showBadgeActivityInApp
    } : {
      hasService: false
    }
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
      hasService,
      sleepable,
      supportsUnreadCount,
      supportsSyncWhenSleeping,
      supportsUnreadActivity,
      badgeColor,
      showBadgeCount,
      showBadgeCountInApp,
      showBadgeActivity,
      showBadgeActivityInApp
    } = this.state
    if (!hasService) { return false }
    if (!supportsUnreadCount && !supportsUnreadActivity) { return false }

    const items = [
      (userHasSleepable && sleepable && !supportsSyncWhenSleeping ? (isLast) => {
        return (
          <SettingsListItemText
            key='info'
            divider={!isLast}
            primaryType='warning'
            primaryIcon={<WarningIcon />}
            primary={(
              <span>
                Badges will only sync for this service when the account is not sleeping. To
                ensure badges are always updated we recommend disabling sleeping for this service
              </span>
            )} />
        )
      } : undefined),
      (isLast) => {
        return (
          <SettingsListItemColorPicker
            key='badgeColor'
            divider={!isLast}
            labelText='Badge Color'
            IconClass={SmsIcon}
            value={badgeColor}
            onChange={(col) => accountActions.reduceService(serviceId, ServiceReducer.setBadgeColor, col)}
            showClear={false}
          />
        )
      },
      (supportsUnreadCount ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showBadgeCount'
            divider={!isLast}
            label='Show unread count in sidebar or toolbar'
            checked={showBadgeCount}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowBadgeCount, toggled)
            }} />
        )
      } : undefined),
      (supportsUnreadCount ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showBadgeCountInApp'
            divider={!isLast}
            label='Show unread count in Menu Bar & App Badge'
            checked={showBadgeCountInApp}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowBadgeCountInApp, toggled)
            }} />
        )
      } : undefined),
      (supportsUnreadActivity ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showUnreadActivityBadge'
            divider={!isLast}
            label={(
              <span>
                <span>Show unread activity in sidebar or toolbar as </span>
                <span className={classes.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            checked={showBadgeActivity}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowBadgeActivity, toggled)
            }} />
        )
      } : undefined),
      (supportsUnreadActivity ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='unreadActivityCountsTowardsAppUnread'
            divider={!isLast}
            label={(
              <span>
                <span>Show unread activity in Menu Bar & App Badge as </span>
                <span className={classes.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            checked={showBadgeActivityInApp}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setShowBadgeActivityInApp, toggled)
            }} />
        )
      } : undefined)
    ].filter((item) => !!item).map((item, index, arr) => {
      return item(index === (arr.length - 1))
    })
    if (!items.length) { return false }

    return (
      <SettingsListSection title='Badges' icon={<AdjustIcon />} {...passProps}>
        {items}
      </SettingsListSection>
    )
  }
}

export default ServiceBadgeSection
