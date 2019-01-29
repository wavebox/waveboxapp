import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog } from '@material-ui/core'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import pluralize from 'pluralize'
import MailboxLinkRulesetDialogContent from './MailboxLinkRulesetDialogContent'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  hiddenButton: {
    display: 'none'
  }
}

@withStyles(styles)
class MailboxLinkRuleset extends React.Component {
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
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.extractStateForMailbox(nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      dialogOpen: false,
      ...this.extractStateForMailbox(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param mailboxId: the id of the mailbox
  * @param accountState: the account state
  */
  extractStateForMailbox (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return mailbox ? {
      userWindowOpenRulesCount: mailbox.userWindowOpenRules.length
    } : {
      userWindowOpenRulesCount: 0
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true })
  }

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false })
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
      ...passProps
    } = this.props
    const {
      userWindowOpenRulesCount,
      dialogOpen
    } = this.state

    return (
      <React.Fragment>
        <SettingsListItemButton
          label='Edit rules'
          primary={`${userWindowOpenRulesCount} window open ${pluralize('rules', userWindowOpenRulesCount)} setup for this account`}
          secondary={userWindowOpenRulesCount === 0 ? (
            'Rules can be configured by setting the default action to ask and saving the behaviour'
          ) : (
            'Links that match these rules will follow their given behaviour'
          )}
          onClick={this.handleOpenDialog}
          buttonProps={userWindowOpenRulesCount === 0 ? { className: classes.hiddenButton } : undefined}
          {...passProps} />
        <Dialog
          disableEnforceFocus
          disableRestoreFocus
          open={dialogOpen}
          onClose={this.handleCloseDialog}>
          <MailboxLinkRulesetDialogContent
            mailboxId={mailboxId}
            onRequestClose={this.handleCloseDialog} />
        </Dialog>
      </React.Fragment>
    )
  }
}

export default MailboxLinkRuleset
