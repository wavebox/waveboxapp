import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistMailboxContainer from './SidelistCommon/SidelistMailboxContainer'
import uuid from 'uuid'
import SidelistServiceTooltip from './SidelistCommon/SidelistServiceTooltip'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import ErrorBoundary from 'wbui/ErrorBoundary'
import Tappable from 'react-tappable/lib/Tappable'
import SidelistTLServiceAvatar from './SidelistCommon/SidelistTLServiceAvatar'

class SidelistItemSingleService extends React.Component {
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

    if (mailbox && serviceId) {
      return {
        hasMembers: true,
        serviceId: serviceId
      }
    } else {
      return {
        hasMembers: false
      }
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
      window.location.hash = `/settings/accounts/${this.props.mailboxId}`
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
    const { mailboxId, sidebarSize, ...passProps } = this.props
    const {
      hasMembers,
      serviceId,
      popover,
      popoverAnchor,
      isHovering
    } = this.state
    if (!hasMembers) { return false }

    return (
      <SidelistMailboxContainer
        id={`ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        {...passProps}>
        <Tappable
          onContextMenu={this.handleOpenPopover}
          onClick={this.handleClick}
          onPress={this.handleLongClick}>
          <SidelistTLServiceAvatar
            mailboxId={mailboxId}
            serviceId={serviceId}
            sidebarSize={sidebarSize}
            isTransientActive={isHovering} />
        </Tappable>
        <ErrorBoundary>
          <SidelistServiceTooltip
            serviceId={serviceId}
            active={isHovering}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
        </ErrorBoundary>
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
