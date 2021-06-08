import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'

const styles = {
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
    lineHeight: '20px',
    fontSize: '16px'
  },
  secondaryText: {
    display: 'inline-block',
    lineHeight: '16px',
    fontSize: '14px',
    color: grey[500]
  }
}

@withStyles(styles)
class UnreadMailboxListItem extends React.Component {
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
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      hasSingleService: mailbox.hasSingleService,
      baseMailboxName: accountState.resolvedMailboxBaseDisplayName(mailboxId),
      extendedMailboxName: accountState.resolvedMailboxExtendedDisplayName(mailboxId),
      serviceDisplayName: accountState.resolvedServiceDisplayName(mailbox.allServices[0])
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      mailboxId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      hasSingleService,
      baseMailboxName,
      extendedMailboxName,
      serviceDisplayName
    } = this.state

    return hasSingleService ? (
      <span className={classNames(className, classes.text)} {...passProps}>
        <span className={classes.primaryText}>{serviceDisplayName}</span>
        <span className={classes.secondaryText}>{baseMailboxName}</span>
      </span>
    ) : (
      <span className={classNames(className, classes.text)} {...passProps}>
        <span className={classes.primaryText}>{baseMailboxName}</span>
        <span className={classes.secondaryText}>{extendedMailboxName}</span>
      </span>
    )
  }
}

export default UnreadMailboxListItem
