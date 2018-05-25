import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions } from 'stores/mailbox'
import { withStyles } from '@material-ui/core/styles'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import red from '@material-ui/core/colors/red'
import LockOutlineIcon from '@material-ui/icons/LockOutline'
import DeleteIcon from '@material-ui/icons/Delete'
import ClearIcon from '@material-ui/icons/Clear'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import SettingsListItemConfirmButton from 'wbui/SettingsListItemConfirmButton'
import BuildIcon from '@material-ui/icons/Build'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

const styles = {
  deleteButton: {
    color: red[600]
  }
}

@withStyles(styles)
class AccountDestructiveSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, ['id', 'supportsAuth']) ||
      partialShallowCompare({}, this.state, {}, nextState)
    )
  }

  render () {
    const {
      mailbox,
      classes,
      ...passProps
    } = this.props

    return (
      <SettingsListSection title='Tools' icon={<BuildIcon />} {...passProps}>
        {mailbox.supportsAuth ? (
          <SettingsListItemButton
            label='Reauthenticate'
            icon={<LockOutlineIcon />}
            onClick={() => mailboxActions.reauthenticateMailbox(mailbox.id)} />
        ) : undefined}
        <SettingsListItemConfirmButton
          label='Clear all browsing data'
          icon={<ClearIcon />}
          confirmLabel='Click again to confirm'
          confirmIcon={<HelpOutlineIcon />}
          confirmWaitMs={4000}
          onConfirmedClick={() => mailboxActions.clearMailboxBrowserSession(mailbox.id)} />
        <SettingsListItemButton
          divider={false}
          buttonProps={{ className: classes.deleteButton }}
          label='Delete this account'
          icon={<DeleteIcon />}
          onClick={() => { window.location.hash = `/mailbox_delete/${mailbox.id}` }} />
      </SettingsListSection>
    )
  }
}

export default AccountDestructiveSettingsSection
