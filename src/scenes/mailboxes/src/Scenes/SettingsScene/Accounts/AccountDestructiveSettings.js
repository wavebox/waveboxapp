import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import ConfirmButton from 'wbui/ConfirmButton'
import { withStyles } from 'material-ui/styles'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListButton from 'wbui/SettingsListButton'
import red from 'material-ui/colors/red'
import LockOutlineIcon from '@material-ui/icons/LockOutline'
import DeleteIcon from '@material-ui/icons/Delete'
import ClearIcon from '@material-ui/icons/Clear'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

const styles = {
  buttonIcon: {
    marginRight: 6
  },
  deleteButton: {
    color: red[600]
  }
}

@withStyles(styles)
class AccountDestructiveSettings extends React.Component {
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
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      classes,
      ...passProps
    } = this.props

    return (
      <SettingsListSection title='' {...passProps}>
        {mailbox.supportsAuth ? (
          <SettingsListButton
            label='Reauthenticate'
            IconClass={LockOutlineIcon}
            onClick={() => mailboxActions.reauthenticateMailbox(mailbox.id)} />
        ) : undefined}
        <SettingsListItem>
          <ConfirmButton
            size='small'
            variant='raised'
            content={(
              <span>
                <ClearIcon className={classes.buttonIcon} />
                Clear all browsing data
              </span>
            )}
            confirmContent={(
              <span>
                <HelpOutlineIcon className={classes.buttonIcon} />
                Click again to confirm
              </span>
            )}
            confirmWaitMs={4000}
            onConfirmedClick={() => mailboxActions.clearMailboxBrowserSession(mailbox.id)} />
        </SettingsListItem>
        <SettingsListButton
          className={classes.deleteButton}
          label='Delete this account'
          IconClass={DeleteIcon}
          onClick={() => { window.location.hash = `/mailbox_delete/${mailbox.id}` }} />
      </SettingsListSection>
    )
  }
}

export default AccountDestructiveSettings
