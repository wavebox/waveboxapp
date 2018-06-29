import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import { basicPopoverStyles400w } from 'wbui/Styles/PopoverStyles'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'

const styles = {
  hr: {
    height: 1,
    border: 0,
    backgroundImage: 'linear-gradient(to right, #bcbcbc, #fff, #bcbcbc)'
  }
}

@withStyles(styles)
class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...ReactPortalTooltip.propTypes,
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateMailboxState(nextProps.mailboxId))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateMailboxState(this.props.mailboxId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateMailboxState(this.props.mailboxId, accountState))
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param accountState=autoget: the current account state
  * @return state object
  */
  generateMailboxState (mailboxId, accountState = accountStore.getState()) {
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      displayName: mailbox.displayName,
      serviceCount: mailbox.allServiceCount,
      unreadCount: accountState.userUnreadCountForMailbox(mailboxId),
      hasUnreadActivity: accountState.userUnreadActivityForMailbox(mailboxId)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      displayName,
      serviceCount,
      unreadCount,
      hasUnreadActivity
    } = this.state

    let unreadContent
    if (unreadCount > 0) {
      const count = unreadCount
      unreadContent = `${count} unread item${count === 1 ? '' : 's'}`
    } else if (hasUnreadActivity) {
      unreadContent = `New unseen items`
    } else {
      unreadContent = `No unread items`
    }

    return (
      <ReactPortalTooltip {...passProps} style={basicPopoverStyles400w}>
        <div>
          {`${displayName} - ${serviceCount} services`}
        </div>
        {unreadContent ? (
          <div>
            <hr className={classes.hr} />
            <div>{unreadContent}</div>
          </div>
        ) : undefined}
      </ReactPortalTooltip>
    )
  }
}

export default MailboxTooltip
