import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'
import DefaultTooltip400w from 'wbui/Tooltips/DefaultTooltip400w'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  root: {
    textAlign: 'center'
  },
  hr: {
    height: 1,
    border: 0,
    backgroundImage: `linear-gradient(to right, ${ThemeTools.getValue(theme, 'wavebox.popover.hr.backgroundGradientColors')})`
  }
})

@withStyles(styles, { withTheme: true })
class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
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
    return {
      displayName: accountState.resolvedMailboxDisplayName(mailboxId),
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
      theme,
      className,
      ...passProps
    } = this.props
    const {
      displayName,
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
      <DefaultTooltip400w {...passProps}>
        <div className={classes.root}>
          <div>{displayName}</div>
          {unreadContent ? (
            <div>
              <hr className={classes.hr} />
              <div>{unreadContent}</div>
            </div>
          ) : undefined}
        </div>
      </DefaultTooltip400w>
    )
  }
}

export default MailboxTooltip
