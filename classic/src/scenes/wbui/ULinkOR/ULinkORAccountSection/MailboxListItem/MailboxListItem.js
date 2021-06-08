import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Collapse, ListItemSecondaryAction, IconButton, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ACAvatarCircle2 from '../../../ACAvatarCircle2'
import classNames from 'classnames'
import ULinkORListItem from '../../ULinkORListItem'
import ULinkORListItemText from '../../ULinkORListItemText'
import MailboxBadge from '../../../MailboxBadge'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MailboxListItemSubServices from './MailboxListItemSubServices'
import ReactDOM from 'react-dom'

const privAccountStore = Symbol('privAccountStore')

const styles = {
  root: {
    paddingTop: 4,
    paddingBottom: 4,
    height: 65
  },
  avatarContainer: {
    position: 'relative',
    width: 36,
    minWidth: 36,
    height: 36,
    minHeight: 36,
    marginRight: 4
  }
}

@withStyles(styles)
class MailboxListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    onOpenInRunningService: PropTypes.func.isRequired,
    onOpenInServiceWindow: PropTypes.func.isRequired,
    onOpenInMailboxWindow: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
    this[privAccountStore] = this.props.accountStore

    // Generate state
    this.state = {
      expanded: false,
      ...this.generateServiceState(this.props.mailboxId, this[privAccountStore].getState())
    }
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this[privAccountStore].listen(this.accountUpdated)
  }

  componentWillUnmount () {
    this[privAccountStore].unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.accountStore !== nextProps.accountStore) {
      console.warn('Changing props.accountStore is not supported in ULinkORAccountResultListItem and will be ignored')
    }

    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.generateServiceState(nextProps.mailboxId, this[privAccountStore].getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  accountUpdated = (accountState) => {
    this.setState(
      this.generateServiceState(this.props.mailboxId, accountState)
    )
  }

  generateServiceState (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)

    if (mailbox) {
      return {
        membersAvailable: true,
        badgeColor: mailbox.badgeColor,
        unreadCount: accountState.userUnreadCountForMailbox(mailboxId),
        hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId),
        avatar: accountState.getMailboxAvatarConfig(mailboxId),
        mailboxDisplayNamePrimary: mailbox.hasSingleService ? (
          accountState.resolvedServiceDisplayName(mailbox.allServices[0])
        ) : (
          accountState.resolvedMailboxBaseDisplayName(mailboxId)
        ),
        mailboxDisplayNameSecondary: mailbox.hasSingleService ? (
          accountState.resolvedMailboxBaseDisplayName(mailboxId)
        ) : (
          accountState.resolvedMailboxExtendedDisplayName(mailboxId)
        )
      }
    } else {
      return {
        membersAvailable: false
      }
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a click somewhere in the list item
  * @param evt: the event that fired
  */
  handleListItemClick = (evt) => {
    const { onOpenInMailboxWindow, mailboxId, onClick } = this.props
    onOpenInMailboxWindow(evt, mailboxId)

    if (onClick) {
      onClick(evt)
    }
  }

  /**
  * Handles a key down event
  * @param evt: the event that fired
  */
  handleKeyDown = (evt) => {
    const { onKeyDown } = this.props

    if (evt.keyCode === 37) {
      this.setState({ expanded: false })
    } else if (evt.keyCode === 39) {
      this.setState({ expanded: true })
    } else {
      if (onKeyDown) {
        onKeyDown(evt)
      }
    }
  }

  /**
  * Handles one of the children collapsing the keyboard
  * @param evt: the event that fired
  */
  handleChildKeyDown = (evt) => {
    const { onKeyDown } = this.props

    if (evt.keyCode === 37) {
      const focusEl = ReactDOM.findDOMNode(this.rootRef.current).querySelector('[data-ulinkor-keyboard-target="true"]')
      if (focusEl) {
        focusEl.focus()
      }
      this.setState({ expanded: false })
    } else {
      if (onKeyDown) {
        onKeyDown(evt)
      }
    }
  }

  /**
  * Toggles expanding the services
  * @param evt: the event that fired
  */
  handleToggleExpand = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    this.setState({ expanded: !this.state.expanded })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      mailboxId,
      avatarResolver,
      accountStore,
      onOpenInRunningService,
      onOpenInServiceWindow,
      className
    } = this.props
    const {
      membersAvailable,
      unreadCount,
      hasUnreadActivity,
      badgeColor,
      avatar,
      mailboxDisplayNamePrimary,
      mailboxDisplayNameSecondary,
      expanded
    } = this.state
    if (!membersAvailable) { return false }

    return (
      <React.Fragment>
        <ULinkORListItem
          ref={this.rootRef}
          className={classNames(className, classes.root)}
          onKeyDown={this.handleKeyDown}
          onClick={this.handleListItemClick}>
          <div className={classes.avatarContainer}>
            <MailboxBadge color={badgeColor} unreadCount={unreadCount} hasUnreadActivity={hasUnreadActivity}>
              <ACAvatarCircle2
                avatar={avatar}
                resolver={avatarResolver}
                size={36} />
            </MailboxBadge>
          </div>
          <ULinkORListItemText
            primary={mailboxDisplayNamePrimary}
            primaryTypographyProps={{ noWrap: true }}
            secondary={mailboxDisplayNameSecondary}
            secondaryTypographyProps={{ noWrap: true }} />
          <ListItemSecondaryAction>
            <Tooltip title='All services'>
              <IconButton onClick={this.handleToggleExpand}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ULinkORListItem>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <MailboxListItemSubServices
            onItemKeyDown={this.handleChildKeyDown}
            mailboxId={mailboxId}
            accountStore={accountStore}
            avatarResolver={avatarResolver}
            onOpenInRunningService={onOpenInRunningService}
            onOpenInServiceWindow={onOpenInServiceWindow} />
        </Collapse>
      </React.Fragment>
    )
  }
}

export default MailboxListItem
