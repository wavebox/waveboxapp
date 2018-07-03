import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistMailboxContainer from '../SidelistCommon/SidelistMailboxContainer'
import uuid from 'uuid'
import Color from 'color'
import StyledMailboxServiceBadge from '../SidelistCommon/StyledMailboxServiceBadge'
import SidelistActiveIndicator from '../SidelistCommon/SidelistActiveIndicator'
import SidelistMailboxAvatar from '../SidelistCommon/SidelistMailboxAvatar'
import SidelistMailboxTooltip from '../SidelistCommon/SidelistMailboxTooltip'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import ErrorBoundary from 'wbui/ErrorBoundary'

class SidelistItemMultiService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
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
      this.setState(this.generateAccountState(nextProps.mailboxId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      isHovering: false,
      popover: false,
      popoverAnchor: null,
      ...this.generateAccountState(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateAccountState(this.props.mailboxId, accountState))
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param accountState: the current account store state
  * @return state for this object based on accounts
  */
  generateAccountState (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)

    return {
      mailbox: mailbox,
      avatar: accountState.getMailboxAvatarConfig(mailboxId),
      isMailboxSleeping: accountState.isMailboxSleeping(mailboxId),
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      unreadCount: accountState.userUnreadCountForMailbox(mailboxId),
      hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId)
    }
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the item being clicked on
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    evt.preventDefault()
    if (evt.metaKey) {
      window.location.hash = `/settings/accounts/${this.props.mailbox.id}`
    } else {
      accountActions.changeActiveMailbox(this.props.mailboxId)
    }
  }

  /**
  * Opens the popover
  * @param evt: the event that fired
  */
  handleOpenPopover = (evt) => {
    evt.preventDefault()
    this.setState({
      isHovering: false,
      popover: true,
      popoverAnchor: evt.currentTarget
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, ...passProps } = this.props
    const {
      mailbox,
      unreadCount,
      hasUnreadActivity,
      popover,
      popoverAnchor,
      isHovering,
      isMailboxActive,
      isMailboxSleeping,
      avatar
    } = this.state

    if (!mailbox) { return false }

    const rootColor = mailbox.color || '#FFFFFF'
    let avatarBorderColor
    try {
      avatarBorderColor = isMailboxActive || isHovering ? (
        rootColor
      ) : (
        Color(rootColor).lighten(0.4).rgb().string()
      )
    } catch (ex) {
      avatarBorderColor = rootColor
    }

    return (
      <SidelistMailboxContainer
        id={`ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`}
        onContextMenu={this.handleOpenPopover}
        onClick={this.handleClick}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        {...passProps}>
        <StyledMailboxServiceBadge
          supportsUnreadCount
          showUnreadBadge={mailbox.showBadge}
          unreadCount={unreadCount}
          supportsUnreadActivity
          showUnreadActivityBadge={mailbox.showBadge}
          hasUnreadActivity={hasUnreadActivity}
          color={mailbox.badgeColor}
          isAuthInvalid={false}>
          {isMailboxActive ? (<SidelistActiveIndicator color={rootColor} />) : undefined}
          <SidelistMailboxAvatar
            avatar={avatar}
            size={42}
            isSleeping={isMailboxSleeping}
            showColorRing={mailbox.showAvatarColorRing}
            borderColor={avatarBorderColor}
            borderWidth={4} />
          <ErrorBoundary>
            <SidelistMailboxTooltip
              mailboxId={mailboxId}
              active={isHovering}
              group={this.instanceId}
              parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
          </ErrorBoundary>
        </StyledMailboxServiceBadge>
        <ErrorBoundary>
          <MailboxAndServiceContextMenu
            mailboxId={mailboxId}
            isOpen={popover}
            anchor={popoverAnchor}
            onRequestClose={() => this.setState({ popover: false })} />
        </ErrorBoundary>
      </SidelistMailboxContainer>
    )
  }
}

export default SidelistItemMultiService
