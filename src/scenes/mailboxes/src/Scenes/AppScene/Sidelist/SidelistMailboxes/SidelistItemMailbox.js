import PropTypes from 'prop-types'
import React from 'react'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import MailboxServicePopover from '../../MailboxServicePopover'
import SidelistItemMailboxAvatar from './SidelistItemMailboxAvatar'
import SidelistItemMailboxServices from './SidelistItemMailboxServices'
import { withStyles } from 'material-ui/styles'
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
  },
  mailboxContainerRestricted: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
export default class SidelistItemMailbox extends React.Component {
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
      popover: false,
      popoverAnchor: null,
      popoverServiceType: undefined,
      userHasServices: userState.user.hasServices,
      isRestricted: mailboxState.isMailboxRestricted(mailboxId)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    const { mailboxId } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox,
      isRestricted: mailboxState.isMailboxRestricted(mailboxId)
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      userHasServices: userState.user.hasServices,
      isRestricted: mailboxState.isMailboxRestricted(this.props.mailboxId)
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
  handleOpenPopover = (evt, serviceType) => {
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

  render () {
    if (!this.state.mailbox) { return false }
    const {
      mailbox,
      popover,
      popoverAnchor,
      popoverServiceType,
      userHasServices,
      isRestricted
    } = this.state
    const { classes, className, mailboxId, ...passProps } = this.props

    return (
      <div
        {...passProps}
        className={classNames(
          classes.mailboxContainer,
          isRestricted ? classes.mailboxContainerRestricted : undefined,
          'WB-SidelistItemMailbox',
          className
        )}>
        <SidelistItemMailboxAvatar
          mailboxId={mailboxId}
          serviceType={CoreMailbox.SERVICE_TYPES.DEFAULT}
          onContextMenu={(evt) => this.handleOpenPopover(evt, CoreMailbox.SERVICE_TYPES.DEFAULT)}
          onClick={this.handleClick} />
        {userHasServices && mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR ? (
          <SidelistItemMailboxServices
            mailboxId={mailboxId}
            onContextMenuService={(evt, serviceType) => this.handleOpenPopover(evt, serviceType)}
            onOpenService={this.handleOpenService} />
        ) : undefined}
        <MailboxServicePopover
          mailboxId={mailboxId}
          serviceType={popoverServiceType}
          isOpen={popover}
          anchor={popoverAnchor}
          onRequestClose={() => this.setState({ popover: false })} />
      </div>
    )
  }
}
