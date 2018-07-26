import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListItemText from 'wbui/SettingsListItemText'
import { withStyles } from '@material-ui/core/styles'
import MailboxCredentialItem from './MailboxCredentialItem'

const styles = {

}

@withStyles(styles)
export default class MailboxCredentialSettings extends React.Component {
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
    return {
      authIds: accountState.getMailboxAuthIdsForMailbox(mailboxId)
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
      showRestart,
      classes,
      ...passProps
    } = this.props
    const {
      authIds
    } = this.state

    return (
      <SettingsListSection title='Credentials' icon={<FingerprintIcon />} {...passProps}>
        <SettingsListItemText
          primary={`Some accounts store credentials when being added, they are used to provide API access and sync`} />
        {authIds.length ? (
          authIds.map((authId, index, arr) => {
            return (
              <MailboxCredentialItem
                key={authId}
                divider={index !== arr.length - 1}
                authId={authId} />
            )
          })
        ) : (
          <SettingsListItemText
            divider={false}
            primaryType='muted'
            primary={`No credentails are attached to this account`} />
        )}
      </SettingsListSection>
    )
  }
}
