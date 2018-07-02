import PropTypes from 'prop-types'
import React from 'react'
import { accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import red from '@material-ui/core/colors/red'
import DeleteIcon from '@material-ui/icons/Delete'
import ClearIcon from '@material-ui/icons/Clear'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import SettingsListItemConfirmButton from 'wbui/SettingsListItemConfirmButton'
import BuildIcon from '@material-ui/icons/Build'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  deleteButton: {
    color: red[600]
  }
}

@withStyles(styles)
class MailboxToolsSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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

    return (
      <SettingsListSection title='Tools' icon={<BuildIcon />} {...passProps}>
        <SettingsListItemConfirmButton
          label='Clear all browsing data'
          icon={<ClearIcon />}
          confirmLabel='Click again to confirm'
          confirmIcon={<HelpOutlineIcon />}
          confirmWaitMs={4000}
          onConfirmedClick={() => accountActions.clearMailboxBrowserSession(mailboxId)} />
        <SettingsListItemButton
          divider={false}
          buttonProps={{ className: classes.deleteButton }}
          label='Delete this account'
          icon={<DeleteIcon />}
          onClick={() => { window.location.hash = `/mailbox_delete/${mailboxId}` }} />
      </SettingsListSection>
    )
  }
}

export default MailboxToolsSettings
