import PropTypes from 'prop-types'
import React from 'react'
import { Badge, FontIcon } from 'material-ui'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../SidelistStyles'
import { mailboxPopoverStyles } from '../SidelistPopoverStyles'
import ReactPortalTooltip from 'react-portal-tooltip'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import uuid from 'uuid'
import SidelistItemMailboxPopover from './SidelistItemMailboxPopover'
import SidelistItemMailboxAvatar from './SidelistItemMailboxAvatar'
import SidelistItemMailboxServices from './SidelistItemMailboxServices'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistItemMailbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isFirst: PropTypes.bool.isRequired,
    isLast: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId } = this.props
    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      isActive: mailboxState.activeMailboxId() === mailboxId,
      activeService: mailboxState.activeMailboxService(),
      popover: false,
      popoverAnchor: null,
      popoverServiceType: undefined,
      hovering: false,
      generatedId: uuid.v4(),
      userHasServices: userState.user.hasServices,
      isRestricted: mailboxState.isMailboxRestricted(mailboxId, userState.user)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    const { mailboxId } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    const userState = userStore.getState()
    this.setState({
      mailbox: mailbox,
      isActive: mailboxState.activeMailboxId() === mailboxId,
      activeService: mailboxState.activeMailboxService(),
      isRestricted: mailboxState.isMailboxRestricted(mailboxId, userState.user)
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      userHasServices: userState.user.hasServices,
      isRestricted: mailboxState.isMailboxRestricted(this.props.mailboxId, userState.user)
    })
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
      mailboxActions.changeActive(this.props.mailboxId)
    }
  }

  /**
  * Handles opening a service
  * @param evt: the event that fired
  * @param service: the service to open
  */
  handleOpenService = (evt, service) => {
    evt.preventDefault()
    mailboxActions.changeActive(this.props.mailboxId, service)
  }

  /**
  * Opens the popover
  * @param evt: the event that fired
  * @param serviceType: the type of service to open in the context of
  */
  handleOpenPopover (evt, serviceType) {
    evt.preventDefault()
    this.setState({
      popover: true,
      popoverAnchor: evt.currentTarget,
      popoverServiceType: serviceType
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the badge element
  * @param mailbox: the mailbox to render for
  * @param isRestricted: true if the mailbox is restricted
  * @return jsx
  */
  renderBadge (mailbox, isRestricted) {
    let badgeContent
    if (isRestricted) {
      badgeContent = undefined
    } else if (mailbox.isAuthenticationInvalid) {
      badgeContent = (<FontIcon className='fa fa-exclamation' style={styles.mailboxBadgeFAIcon} />)
    } else {
      if (mailbox.showUnreadBadge && mailbox.unreadCount) {
        badgeContent = mailbox.unreadCount >= 1000 ? Math.floor(mailbox.unreadCount / 1000) + 'K+' : mailbox.unreadCount
      } else if (mailbox.showUnreadActivityBadge && mailbox.hasUnreadActivity) {
        badgeContent = '●'
      }
    }

    if (badgeContent !== undefined) {
      return (
        <Badge
          onContextMenu={(evt) => this.handleOpenPopover(evt, CoreMailbox.SERVICE_TYPES.DEFAULT)}
          onClick={this.handleClick}
          badgeContent={badgeContent}
          badgeStyle={styles.mailboxBadge}
          style={styles.mailboxBadgeContainer} />
      )
    } else {
      return undefined
    }
  }

  /**
  * Renders the active indicator
  * @param mailbox: the mailbox to render for
  * @param isActive: true if the mailbox is active
  * @return jsx
  */
  renderActiveIndicator (mailbox, isActive) {
    if (isActive) {
      return (
        <div
          onClick={this.handleClick}
          style={Object.assign({ backgroundColor: mailbox.color }, styles.mailboxActiveIndicator)} />
      )
    } else {
      return undefined
    }
  }

  /**
  * Renders the tooltip
  * @param mailbox: the mailbox to render for
  * @param hovering: true if we are currently hovering over this item
  * @param generatedId: the generated id for this instance
  * @param isRestricted: true if the mailbox is restricted
  * @return jsx
  */
  renderTooltip (mailbox, hovering, generatedId, isRestricted) {
    if (!mailbox.displayName) { return undefined }

    let unreadText
    if (isRestricted) {
      unreadText = (
        <span>
          <FontIcon className='fa fa-fw fa-diamond' style={{ color: 'white', fontSize: 16 }} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (mailbox.isAuthenticationInvalid) {
      unreadText = (
        <span style={{ color: Colors.redA200 }}>
          <FontIcon className='fa fa-fw fa-exclamation-circle' style={{ color: Colors.redA200, fontSize: 16 }} />
          <span>Authentication Problem. Right click to reauthenticate</span>
        </span>
      )
    } else {
      if (mailbox.unreadCount > 0) {
        unreadText = `${mailbox.unreadCount} unread ${mailbox.humanizedUnreadItemType}${mailbox.unreadCount === 1 ? '' : 's'}`
      } else {
        if (mailbox.hasUnreadActivity) {
          unreadText = `New unseen ${mailbox.humanizedUnreadItemType}s`
        } else {
          unreadText = `No unread ${mailbox.humanizedUnreadItemType}s`
        }
      }
    }

    return (
      <ReactPortalTooltip
        active={hovering}
        tooltipTimeout={0}
        style={mailboxPopoverStyles}
        position='right'
        arrow='left'
        group={generatedId}
        parent={`#ReactComponent-Sidelist-Item-Mailbox-${generatedId}-Main-Avatar`}>
        <div>{mailbox.displayName}</div>
        <hr style={styles.mailboxTooltipRule} />
        <div>{unreadText}</div>
      </ReactPortalTooltip>
    )
  }

  render () {
    if (!this.state.mailbox) { return false }
    const {
      mailbox,
      isActive,
      activeService,
      popover,
      popoverAnchor,
      popoverServiceType,
      hovering,
      generatedId,
      userHasServices,
      isRestricted
    } = this.state
    const { index, isFirst, isLast, style, ...passProps } = this.props
    delete passProps.mailboxId

    const containerStyle = Object.assign(
      {},
      styles.itemContainer,
      styles.mailboxItemContainer,
      isRestricted ? styles.mailboxItemContainerRestricted : undefined,
      style
    )

    const isAvatarActive = (mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR)
      ? isActive && activeService === CoreMailbox.SERVICE_TYPES.DEFAULT
      : isActive

    return (
      <div
        {...passProps}
        style={containerStyle}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}>
        {this.renderTooltip(mailbox, hovering, generatedId, isRestricted)}
        <SidelistItemMailboxAvatar
          id={`ReactComponent-Sidelist-Item-Mailbox-${generatedId}-Main-Avatar`}
          onContextMenu={(evt) => this.handleOpenPopover(evt, CoreMailbox.SERVICE_TYPES.DEFAULT)}
          isActive={isAvatarActive}
          isHovering={hovering}
          mailbox={mailbox}
          index={index}
          onClick={this.handleClick} />
        {userHasServices && mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR ? (
          <SidelistItemMailboxServices
            onContextMenuService={(evt, serviceType) => this.handleOpenPopover(evt, serviceType)}
            mailbox={mailbox}
            isActiveMailbox={isActive}
            activeService={activeService}
            onOpenService={this.handleOpenService} />
        ) : undefined}
        {this.renderBadge(mailbox, isRestricted)}
        {this.renderActiveIndicator(mailbox, isActive)}
        <SidelistItemMailboxPopover
          mailbox={mailbox}
          serviceType={popoverServiceType}
          isFirst={isFirst}
          isLast={isLast}
          isOpen={popover}
          anchor={popoverAnchor}
          onRequestClose={() => this.setState({ popover: false })} />
      </div>
    )
  }
}
