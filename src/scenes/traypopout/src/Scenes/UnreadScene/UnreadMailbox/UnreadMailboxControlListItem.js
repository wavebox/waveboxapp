import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import { ListItem } from '@material-ui/core'
import MailboxBadge from 'wbui/MailboxBadge'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import Resolver from 'Runtime/Resolver'
import classNames from 'classnames'
import MailboxDisplayName from '../Common/MailboxDisplayName'

const styles = {
  root: {
    cursor: 'pointer'
  },
  backArrow: {
    color: grey[400]
  }
}

@withStyles(styles)
class UnreadMailboxControlListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    requestShowMailboxList: PropTypes.func.isRequired,
    requestSwitchMailbox: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateMailboxState(nextProps.mailboxId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateMailboxState(this.props.mailboxId)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState(this.generateMailboxState(this.props.mailboxId, mailboxState))
  }

  /**
  * Generates the mailbox state
  * @param mailboxId: the id of the mailbox
  * @param mailboxState=autoget: the current store state
  * @return the mailbox state
  */
  generateMailboxState (mailboxId, accountState = accountStore.getState()) {
    return {
      mailbox: accountState.getMailbox(mailboxId),
      unreadCount: accountState.userUnreadCountForMailbox(mailboxId),
      hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId),
      avatar: accountState.getMailboxAvatarConfig(mailboxId)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, requestSwitchMailbox, requestShowMailboxList, classes, className, ...passProps } = this.props
    const { mailbox, avatar, unreadCount, hasUnreadActivity } = this.state

    return (
      <ListItem
        button
        className={classNames(classes.root, className)}
        onClick={(evt) => requestShowMailboxList(evt, mailboxId)}
        {...passProps}>
        <KeyboardArrowLeftIcon className={classes.backArrow} />
        <MailboxDisplayName mailboxId={mailboxId} />
        <MailboxBadge mailbox={mailbox} unreadCount={unreadCount} hasUnreadActivity={hasUnreadActivity}>
          <ACAvatarCircle
            avatar={avatar}
            resolver={(i) => Resolver.image(i)}
            size={40}
            onClick={(evt) => {
              evt.preventDefault()
              evt.stopPropagation()
              requestSwitchMailbox(evt, mailboxId)
            }} />
        </MailboxBadge>
      </ListItem>
    )
  }
}

export default UnreadMailboxControlListItem
