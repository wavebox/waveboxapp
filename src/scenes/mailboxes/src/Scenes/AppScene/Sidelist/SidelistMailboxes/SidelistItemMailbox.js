import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxServicePopover from '../../MailboxServicePopover'
import SidelistItemMailboxAvatar from './SidelistItemMailboxAvatar'
//import SidelistItemMailboxServices from './SidelistItemMailboxServices'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  /**
  * Layout
  */
  mailboxContainer: {
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
    textAlign: 'center'
  }
}

@withStyles(styles)
class SidelistItemMailbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId } = this.props
    const accountState = accountStore.getState()
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      popover: false,
      popoverAnchor: null,
      popoverServiceId: undefined
    }
  })()

  accountChanged = (accountState) => {
    const { mailboxId } = this.props
    const mailbox = accountState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox
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
      accountActions.changeActiveMailbox(this.props.mailboxId)
    }
  }

  /**
  * Handles opening a service
  * @param evt: the event that fired
  * @param serviceId: the service to open
  */
  handleOpenService = (evt, serviceId) => {
    evt.preventDefault()
    accountActions.changeActiveService(serviceId)
  }

  /**
  * Opens the popover
  * @param evt: the event that fired
  * @param serviceId: the id of service to open in the context of
  */
  handleOpenPopover = (evt, serviceId) => {
    evt.preventDefault()
    this.setState({
      popover: true,
      popoverAnchor: evt.currentTarget,
      popoverServiceId: serviceId
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (!this.state.mailbox) { return false }
    const {
      classes,
      className,
      mailboxId,
      ...passProps
    } = this.props
    const {
      mailbox,
      popover,
      popoverAnchor,
      popoverServiceId
    } = this.state

    return (
      <div
        className={classNames(classes.mailboxContainer, 'WB-SidelistItemMailbox', className)}
        {...passProps}>
        <SidelistItemMailboxAvatar
          mailboxId={mailboxId}
          onContextMenu={(evt) => this.handleOpenPopover(evt, mailbox.allServices[0])}
          onClick={this.handleClick} />
        {/*
        {mailbox.sidebarServices.length ? (
          <SidelistItemMailboxServices
            mailboxId={mailboxId}
            onContextMenuService={(evt, serviceId) => this.handleOpenPopover(evt, serviceId)}
            onOpenService={this.handleOpenService} />
        ) : undefined}
        */}
        {popoverServiceId ? (
          <MailboxServicePopover
            mailboxId={mailboxId}
            serviceId={popoverServiceId}
            isOpen={popover}
            anchor={popoverAnchor}
            onRequestClose={() => this.setState({ popover: false })} />
        ) : undefined}
      </div>
    )
  }
}

export default SidelistItemMailbox
