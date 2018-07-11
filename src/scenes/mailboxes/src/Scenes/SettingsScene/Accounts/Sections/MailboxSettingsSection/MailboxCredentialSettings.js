import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListItemConfirmButton from 'wbui/SettingsListItemConfirmButton'
import SettingsListItemText from 'wbui/SettingsListItemText'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'

const styles = {
  deleteButton: {
    color: red[600]
  }
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
      auths: accountState.getMailboxAuthsForMailbox(mailboxId)
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
      auths
    } = this.state

    return (
      <SettingsListSection title='Credentials' icon={<FingerprintIcon />} {...passProps}>
        <SettingsListItemText
          primary={`Some accounts store credentials when being added, they are used to provide API access and sync`} />
        {auths.length ? (
          auths.map((auth, index, arr) => {
            return (
              <SettingsListItemConfirmButton
                key={auth.id}
                divider={index !== arr.length - 1}
                label='Remove'
                confirmLabel='Click again to confirm'
                icon={<DeleteIcon />}
                confirmIcon={<HelpOutlineIcon />}
                confirmWaitMs={4000}
                buttonProps={{ variant: 'outlined', className: classes.deleteButton }}
                onConfirmedClick={() => accountActions.removeAuth(auth.id)}
                primary={(<strong>{auth.humanizedNamespace}</strong>)}
                secondary={auth.namespace} />
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
