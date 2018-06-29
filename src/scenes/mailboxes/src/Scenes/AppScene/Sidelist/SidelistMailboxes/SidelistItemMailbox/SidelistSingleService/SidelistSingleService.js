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
import SidelistServiceTooltip from '../SidelistCommon/SidelistServiceTooltip'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import ErrorBoundary from 'wbui/ErrorBoundary'

class SidelistItemSingleService extends React.Component {
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
    const serviceId = mailbox ? mailbox.singleService : undefined
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return {
      popover: false,
      popoverAnchor: null,
      mailbox: mailbox,
      serviceId: serviceId,
      service: service,
      avatar: accountState.getMailboxAvatarConfig(mailboxId),
      isServiceActive: accountState.activeServiceId() === serviceId,
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      isAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      ...(service && serviceData ? {
        unreadCount: serviceData.getUnreadCount(service),
        hasUnreadActivity: serviceData.getHasUnreadActivity(service)
      } : {
        unreadCount: 0,
        hasUnreadActivity: false
      })
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
      service,
      serviceId,
      unreadCount,
      hasUnreadActivity,
      popover,
      popoverAnchor,
      isHovering,
      isServiceActive,
      isServiceSleeping,
      isAuthInvalid,
      avatar
    } = this.state

    if (!mailbox || !service) { return false }

    const rootColor = mailbox.color || service.color || '#FFFFFF'
    let avatarBorderColor
    try {
      avatarBorderColor = isServiceActive || isHovering ? (
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
          supportsUnreadCount={service.supportsUnreadCount}
          showUnreadBadge={service.showBadgeCount}
          unreadCount={unreadCount}
          supportsUnreadActivity={service.supportsUnreadActivity}
          showUnreadActivityBadge={service.showBadgeActivity}
          hasUnreadActivity={hasUnreadActivity}
          color={service.badgeColor}
          isAuthInvalid={isAuthInvalid}>
          {isServiceActive ? (<SidelistActiveIndicator color={rootColor} />) : undefined}
          <SidelistMailboxAvatar
            avatar={avatar}
            size={42}
            isSleeping={isServiceSleeping}
            showColorRing={mailbox.showAvatarColorRing}
            borderColor={avatarBorderColor}
            borderWidth={4} />
          <ErrorBoundary>
            <SidelistServiceTooltip
              serviceId={serviceId}
              active={isHovering}
              group={this.instanceId}
              parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
          </ErrorBoundary>
        </StyledMailboxServiceBadge>
        <ErrorBoundary>
          <MailboxAndServiceContextMenu
            mailboxId={mailboxId}
            serviceId={serviceId}
            isOpen={popover}
            anchor={popoverAnchor}
            onRequestClose={() => this.setState({ popover: false })} />
        </ErrorBoundary>
      </SidelistMailboxContainer>
    )
  }
}

export default SidelistItemSingleService
