import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import { mailboxStore } from 'stores/mailbox'
import { ListItem, FontIcon, Badge } from 'material-ui'
import MailboxAvatar from 'Components/Mailbox/MailboxAvatar'
import Color from 'color'

const styles = {
  primaryText: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    lineHeight: '20px'
  },
  badge: {
    top: -4,
    right: -4
  },
  badgeContainer: {
    padding: 6
  }
}

export default class UnreadMailboxListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
      unreadCount: mailboxState.mailboxUnreadCountForUser(mailboxId)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param mailbox: the mailbox
  * @return the name of the mailbox
  */
  renderMailboxName (mailbox) {
    if (mailbox.humanizedType === mailbox.displayName) {
      return mailbox.humanizedType
    } else {
      return `${mailbox.humanizedType} : ${mailbox.displayName || 'Untitled'}`
    }
  }

  render () {
    const { mailboxId, ...passProps } = this.props
    const { mailbox, unreadCount } = this.state
    const badgeColor = mailbox.cumulativeSidebarUnreadBadgeColor
    const inverseBadgeColor = badgeColor ? Color(badgeColor).isLight() ? 'black' : 'white' : undefined

    return (
      <ListItem
        {...passProps}
        leftAvatar={(
          <Badge
            style={styles.badgeContainer}
            badgeStyle={{
              ...styles.badge,
              backgroundColor: badgeColor,
              color: inverseBadgeColor,
              ...(unreadCount === 0 ? { display: 'none' } : undefined)
            }}
            badgeContent={unreadCount}>
            <MailboxAvatar mailboxId={mailbox.id} />
          </Badge>
        )}
        primaryText={(
          <span style={styles.primaryText}>{this.renderMailboxName(mailbox)}</span>
        )}
        rightIcon={<FontIcon className='material-icons'>keyboard_arrow_right</FontIcon>} />
    )
  }
}
