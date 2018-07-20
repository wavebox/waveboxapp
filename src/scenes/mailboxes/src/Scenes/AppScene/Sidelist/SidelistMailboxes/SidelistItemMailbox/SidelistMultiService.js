import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistMailboxContainer from './SidelistCommon/SidelistMailboxContainer'
import uuid from 'uuid'
import StyledMailboxServiceBadge from './SidelistCommon/StyledMailboxServiceBadge'
import SidelistActiveIndicator from './SidelistCommon/SidelistActiveIndicator'
import SidelistMailboxAvatar from './SidelistCommon/SidelistMailboxAvatar'
import SidelistMailboxTooltip from './SidelistCommon/SidelistMailboxTooltip'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import ErrorBoundary from 'wbui/ErrorBoundary'
import ServiceTabs from 'Components/ServiceTabs'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import Tappable from 'react-tappable/lib/Tappable'

class SidelistItemMultiService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    sidebarSize: PropTypes.string.isRequired
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
    this.popoverCustomizeClearTO = null
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    clearTimeout(this.popoverCustomizeClearTO)
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
      isHoveringAvatar: false,
      isHoveringGroup: false,
      popover: false,
      popoverAnchor: null,
      popoverMailboxId: undefined,
      popoverServiceId: undefined,
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
      hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId),
      hasInvalidAuth: accountState.hasMailboxServiceWithInvalidAuth(mailboxId),
      isMailboxRestricted: accountState.isMailboxRestricted(mailboxId)
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
    if (evt.metaKey) {
      window.location.hash = `/settings/accounts/${this.props.mailbox.id}`
    } else {
      accountActions.changeActiveMailbox(this.props.mailboxId)
    }
  }

  /**
  * Handles the item being long clicked on
  * @param evt: the event that fired
  */
  handleLongClick = (evt) => {
    accountActions.changeActiveMailbox(this.props.mailboxId, true)
  }

  /**
  * Handles a service being clicked
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleClickService = (evt, serviceId) => {
    evt.preventDefault()
    accountActions.changeActiveService(serviceId)
  }

  /**
  * Opens the popover
  * @param evt: the event that fired
  */
  handleOpenMailboxPopover = (evt) => {
    evt.preventDefault()
    clearTimeout(this.popoverCustomizeClearTO)
    this.setState({
      isHoveringAvatar: false,
      isHoveringGroup: false,
      popover: true,
      popoverMailboxId: this.props.mailboxId,
      popoverServiceId: undefined,
      popoverAnchor: evt.currentTarget
    })
  }

  /**
  * Opens the popover for a service
  * @param evt: the event that fired
  * @param serviceId: the id of the service to open for
  */
  handleOpenServicePopover = (evt, serviceId) => {
    evt.preventDefault()
    clearTimeout(this.popoverCustomizeClearTO)
    this.setState({
      isHoveringAvatar: false,
      isHoveringGroup: false,
      popover: true,
      popoverMailboxId: this.props.mailboxId,
      popoverServiceId: serviceId,
      popoverAnchor: evt.currentTarget
    })
  }

  handleClosePopover = () => {
    clearTimeout(this.popoverCustomizeClearTO)
    this.popoverCustomizeClearTO = setTimeout(() => {
      this.setState({
        popoverMailboxId: undefined,
        popoverServiceId: undefined
      })
    }, 500)
    this.setState({ popover: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, sidebarSize, ...passProps } = this.props
    const {
      mailbox,
      unreadCount,
      hasUnreadActivity,
      popover,
      popoverAnchor,
      isHoveringAvatar,
      isHoveringGroup,
      isMailboxActive,
      isMailboxSleeping,
      avatar,
      popoverMailboxId,
      popoverServiceId,
      hasInvalidAuth,
      isMailboxRestricted
    } = this.state

    if (!mailbox) { return false }

    return (
      <SidelistMailboxContainer
        onMouseEnter={() => this.setState({ isHoveringGroup: true })}
        onMouseLeave={() => this.setState({ isHoveringGroup: false })}
        {...passProps}>
        <Tappable
          onClick={this.handleClick}
          onPress={this.handleLongClick}
          onContextMenu={this.handleOpenMailboxPopover}>
          <StyledMailboxServiceBadge
            id={`ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`}
            sidebarSize={sidebarSize}
            onMouseEnter={() => this.setState({ isHoveringAvatar: true })}
            onMouseLeave={() => this.setState({ isHoveringAvatar: false })}
            supportsUnreadCount
            showUnreadBadge={mailbox.showBadge}
            unreadCount={unreadCount}
            supportsUnreadActivity
            showUnreadActivityBadge={mailbox.showBadge}
            hasUnreadActivity={hasUnreadActivity}
            color={mailbox.badgeColor}
            isAuthInvalid={hasInvalidAuth}>
            {isMailboxActive ? (<SidelistActiveIndicator sidebarSize={sidebarSize} color={avatar.color} />) : undefined}
            <SidelistMailboxAvatar
              avatar={avatar}
              sidebarSize={sidebarSize}
              isSleeping={isMailboxSleeping}
              showRestricted={isMailboxRestricted}
              showColorRing={mailbox.showAvatarColorRing}
              lightenBorder={!isMailboxActive && !isHoveringGroup} />
          </StyledMailboxServiceBadge>
        </Tappable>
        <ErrorBoundary>
          <SidelistMailboxTooltip
            mailboxId={mailboxId}
            active={isHoveringAvatar}
            group={this.instanceId}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
        </ErrorBoundary>
        <ServiceTabs
          mailboxId={mailboxId}
          uiLocation={ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR}
          sidebarSize={sidebarSize}
          onOpenService={this.handleClickService}
          onContextMenuService={this.handleOpenServicePopover} />
        {popoverMailboxId || popoverServiceId ? (
          <ErrorBoundary>
            <MailboxAndServiceContextMenu
              mailboxId={popoverMailboxId}
              serviceId={popoverServiceId}
              isOpen={popover}
              anchor={popoverAnchor}
              onRequestClose={this.handleClosePopover} />
          </ErrorBoundary>
        ) : undefined}
      </SidelistMailboxContainer>
    )
  }
}

export default SidelistItemMultiService
