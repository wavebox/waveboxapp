import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import LinkIcon from '@material-ui/icons/Link'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import MailboxLinkRuleset from './MailboxLinkRuleset'
import MailboxLinkNoMatchRule from './MailboxLinkNoMatchRule'

export default class MailboxLinkSettings extends React.Component {
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
      const accountState = accountStore.getState()
      this.setState({
        ...this.extractStateForMailbox(nextProps.mailboxId, accountState)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      ...this.extractStateForMailbox(this.props.mailboxId, accountState)
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
      openDriveLinksWithExternalBrowser: mailbox.openDriveLinksWithExternalBrowser
    } : {
      openDriveLinksWithExternalBrowser: false
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
      ...passProps
    } = this.props
    const {
      openDriveLinksWithExternalBrowser
    } = this.state

    return (
      <SettingsListSection title='Links' icon={<LinkIcon />} {...passProps}>
        <MailboxLinkRuleset mailboxId={mailboxId} />
        <MailboxLinkNoMatchRule mailboxId={mailboxId} />
        <SettingsListItemSwitch
          divider={false}
          label='Always open Google Drive links in the default browser'
          checked={openDriveLinksWithExternalBrowser}
          onChange={(evt, toggled) => {
            accountActions.reduceMailbox(mailboxId, MailboxReducer.setOpenDriveLinksWithExternalBrowser, toggled)
          }} />
      </SettingsListSection>
    )
  }
}
