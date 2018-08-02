import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import StyledMailboxServiceBadge from './StyledMailboxServiceBadge'
import SidelistActiveIndicator from './SidelistActiveIndicator'
import SidelistAvatar from './SidelistAvatar'

class SidelistTLMailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
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
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.deriveAccountState(nextProps.mailboxId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveAccountState(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.deriveAccountState(this.props.mailboxId, accountState))
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param accountState: the current account store state
  * @return state for this object based on accounts
  */
  deriveAccountState (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    if (mailbox) {
      return {
        hasMembers: true,
        avatar: accountState.getMailboxAvatarConfig(mailboxId),
        isMailboxSleeping: accountState.isMailboxSleeping(mailboxId),
        isMailboxActive: accountState.activeMailboxId() === mailboxId,
        unreadCount: accountState.userUnreadCountForMailbox(mailboxId),
        hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId),
        hasInvalidAuth: accountState.hasMailboxServiceWithInvalidAuth(mailboxId),
        isMailboxRestricted: accountState.isMailboxRestricted(mailboxId),
        showBadge: mailbox.showBadge,
        badgeColor: mailbox.badgeColor,
        showAvatarColorRing: mailbox.showAvatarColorRing
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
      sidebarSize,
      isTransientActive,
      forceIndicator,
      badgeProps,
      avatarProps,
      indicatorProps,
      ...passProps
    } = this.props
    const {
      hasMembers,
      avatar,
      isMailboxSleeping,
      isMailboxActive,
      unreadCount,
      hasUnreadActivity,
      hasInvalidAuth,
      isMailboxRestricted,
      showBadge,
      badgeColor,
      showAvatarColorRing
    } = this.state
    if (!hasMembers) { return false }

    return (
      <StyledMailboxServiceBadge
        sidebarSize={sidebarSize}
        supportsUnreadCount
        showUnreadBadge={showBadge}
        unreadCount={unreadCount}
        supportsUnreadActivity
        showUnreadActivityBadge={showBadge}
        hasUnreadActivity={hasUnreadActivity}
        color={badgeColor}
        isAuthInvalid={hasInvalidAuth}
        {...badgeProps}
        {...passProps}>
        {isMailboxActive || forceIndicator ? (
          <SidelistActiveIndicator
            sidebarSize={sidebarSize}
            color={avatar.color}
            {...indicatorProps} />
        ) : undefined}
        <SidelistAvatar
          avatar={avatar}
          sidebarSize={sidebarSize}
          isSleeping={isMailboxSleeping}
          showRestricted={isMailboxRestricted}
          showColorRing={showAvatarColorRing}
          lightenBorder={!isMailboxActive && !isTransientActive} />
      </StyledMailboxServiceBadge>
    )
  }
}

export default SidelistTLMailboxAvatar
