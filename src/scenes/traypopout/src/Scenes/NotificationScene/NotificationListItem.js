import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItem, ListItemText } from '@material-ui/core'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
import TimeAgo from 'react-timeago'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import Resolver from 'Runtime/Resolver'
import classNames from 'classnames'
import grey from '@material-ui/core/colors/grey'

const styles = {
  listItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottom: '1px solid rgb(224, 224, 224)'
  },
  listItemInner: {
    paddingTop: 8,
    paddingBottom: 8
  },
  listItemPrimaryText: {
    fontSize: 14,
    lineHeight: '16px',
    height: 16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listItemSecondaryText: {
    height: 'auto'
  },
  listItemNotificationBody: {
    fontSize: 13,
    lineHeight: '15px',
    height: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: grey[500]
  },
  listItemTimeago: {
    fontSize: 11,
    color: grey[500]
  },
  listItemIcon: {
    height: 40,
    width: 40,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

@withStyles(styles)
class NotificationListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    notification: PropTypes.object.isRequired,
    timestamp: PropTypes.any
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
  * @param accountState=autoget: the current store state
  * @return the mailbox state
  */
  generateMailboxState (mailboxId, accountState = accountStore.getState()) {
    return {
      avatar: accountState.getMailboxAvatarConfig(mailboxId)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, mailboxId, notification, timestamp, className, ...passProps } = this.props
    const { avatar } = this.state

    return (
      <ListItem button className={classNames(classes.listItem, className)} {...passProps}>
        <ACAvatarCircle avatar={avatar} resolver={(i) => Resolver.image(i)} />
        <ListItemText
          primary={(<div className={classes.listItemPrimaryText}>{notification.title}</div>)}
          disableTypography
          secondary={(
            <div className={classes.listItemSecondaryText}>
              <div className={classes.listItemNotificationBody}>{notification.body || ''}</div>
              <div className={classes.listItemTimeago}>
                <TimeAgo date={timestamp} />
              </div>
            </div>
          )} />
        {notification.icon ? (
          <div className={classes.listItemIcon} style={{ backgroundImage: `url("${notification.icon}")` }} />
        ) : undefined}
      </ListItem>
    )
  }
}

export default NotificationListItem
