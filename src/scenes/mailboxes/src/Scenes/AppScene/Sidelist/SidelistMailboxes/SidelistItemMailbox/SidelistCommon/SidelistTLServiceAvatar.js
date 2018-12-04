import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import StyledMailboxServiceBadge from './StyledMailboxServiceBadge'
import SidelistActiveIndicator from './SidelistActiveIndicator'
import SidelistAvatar from './SidelistAvatar'
import classNames from 'classnames'

class SidelistTLServiceAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    sidebarSize: PropTypes.string.isRequired,
    isTransientActive: PropTypes.bool.isRequired,
    forceIndicator: PropTypes.bool.isRequired,
    badgeProps: PropTypes.object,
    avatarProps: PropTypes.object,
    indicatorProps: PropTypes.object
  }

  static defaultProps = {
    forceIndicator: false
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.deriveAccountState(nextProps.mailboxId, nextProps.serviceId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveAccountState(this.props.mailboxId, this.props.serviceId, accountStore.getState()),
      globalShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.deriveAccountState(this.props.mailboxId, this.props.serviceId, accountState))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of the service
  * @param accountState: the current account store state
  * @return state for this object based on accounts
  */
  deriveAccountState (mailboxId, serviceId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    if (mailbox && service) {
      return {
        hasMembers: true,
        supportsUnreadCount: service.supportsUnreadCount,
        showBadgeCount: service.showBadgeCount,
        supportsUnreadActivity: service.supportsUnreadActivity,
        showBadgeActivity: service.showBadgeActivity,
        badgeColor: service.badgeColor,
        showAvatarColorRing: mailbox.showAvatarColorRing,
        mailboxShowSleepableServiceIndicator: mailbox.showSleepableServiceIndicator,
        avatar: accountState.getMailboxAvatarConfig(mailboxId),
        isActive: accountState.activeServiceId() === serviceId,
        isSleeping: accountState.isServiceSleeping(serviceId),
        isAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
        isRestricted: accountState.isServiceRestricted(serviceId),
        ...(serviceData ? {
          unreadCount: serviceData.getUnreadCount(service),
          hasUnreadActivity: serviceData.getHasUnreadActivity(service)
        } : {
          unreadCount: 0,
          hasUnreadActivity: false
        })
      }
    } else {
      return {
        hasMembers: false
      }
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
      mailboxId,
      serviceId,
      sidebarSize,
      isTransientActive,
      forceIndicator,
      badgeProps,
      avatarProps,
      indicatorProps,
      className,
      ...passProps
    } = this.props
    const {
      hasMembers,
      supportsUnreadCount,
      showBadgeCount,
      supportsUnreadActivity,
      showBadgeActivity,
      badgeColor,
      showAvatarColorRing,
      avatar,
      isActive,
      isSleeping,
      isAuthInvalid,
      isRestricted,
      unreadCount,
      hasUnreadActivity,
      globalShowSleepableServiceIndicator,
      mailboxShowSleepableServiceIndicator
    } = this.state
    if (!hasMembers) { return false }

    return (
      <StyledMailboxServiceBadge
        sidebarSize={sidebarSize}
        supportsUnreadCount={supportsUnreadCount}
        showUnreadBadge={showBadgeCount}
        unreadCount={unreadCount}
        supportsUnreadActivity={supportsUnreadActivity}
        showUnreadActivityBadge={showBadgeActivity}
        hasUnreadActivity={hasUnreadActivity}
        color={badgeColor}
        isAuthInvalid={isAuthInvalid}
        className={classNames(
          className,
          'WB-SidelistItemServiceAvatar',
          `WB-Id-${mailboxId}-${serviceId}`,
          isActive || forceIndicator ? 'WB-Active' : undefined
        )}
        {...badgeProps}
        {...passProps}>
        {isActive || forceIndicator ? (
          <SidelistActiveIndicator
            sidebarSize={sidebarSize}
            color={avatar.color}
            {...indicatorProps} />
        ) : undefined}
        <SidelistAvatar
          avatar={avatar}
          lightenBorder={!isActive && !isTransientActive}
          sidebarSize={sidebarSize}
          isSleeping={isSleeping}
          showSleeping={globalShowSleepableServiceIndicator && mailboxShowSleepableServiceIndicator}
          showRestricted={isRestricted}
          showColorRing={showAvatarColorRing}
          {...avatarProps} />
      </StyledMailboxServiceBadge>
    )
  }
}

export default SidelistTLServiceAvatar
