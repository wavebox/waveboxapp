import React from 'react'
import PropTypes from 'prop-types'
import { mailboxStore } from 'stores/mailbox'
import { ListItem } from 'material-ui'
import MailboxBadge from 'wbui/MailboxBadge'
import MailboxAvatar from 'wbui/MailboxAvatar'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import { withStyles } from 'material-ui/styles'
import grey from 'material-ui/colors/grey'
import Resolver from 'Runtime/Resolver'
import classNames from 'classnames'

const styles = {
  root: {
    cursor: 'pointer'
  },
  text: {
    width: '100%',
    paddingLeft: 24,
    paddingRight: 24
  },
  primaryText: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    lineHeight: '18px',
    fontSize: '16px'
  },
  secondaryText: {
    display: 'inline-block',
    lineHeight: '16px',
    fontSize: '14px',
    color: grey[500]
  },
  forwardArrow: {
    color: grey[400]
  }
}

@withStyles(styles)
export default class UnreadMailboxListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    requestShowMailbox: PropTypes.func.isRequired,
    requestSwitchMailbox: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
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
  generateMailboxState (mailboxId, mailboxState = mailboxStore.getState()) {
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      unreadCount: mailboxState.mailboxUnreadCountForUser(mailboxId),
      resolvedAvatar: mailboxState.getResolvedAvatar(mailboxId, (i) => Resolver.image(i))
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, requestSwitchMailbox, requestShowMailbox, classes, className, ...passProps } = this.props
    const { mailbox, resolvedAvatar, unreadCount } = this.state

    return (
      <ListItem
        button
        className={classNames(classes.root, className)}
        onClick={(evt) => requestShowMailbox(evt, mailboxId)}
        {...passProps}>
        <MailboxBadge mailbox={mailbox} unreadCount={unreadCount}>
          <MailboxAvatar
            mailbox={mailbox}
            resolvedAvatar={resolvedAvatar}
            size={40}
            onClick={(evt) => {
              evt.preventDefault()
              evt.stopPropagation()
              requestSwitchMailbox(evt, mailboxId)
            }} />
        </MailboxBadge>
        <span className={classes.text}>
          <span className={classes.primaryText}>{mailbox.displayName || 'Untitled'}</span>
          <span className={classes.secondaryText}>{mailbox.humanizedType}</span>
        </span>
        <KeyboardArrowRightIcon className={classes.forwardArrow} />
      </ListItem>
    )
  }
}
