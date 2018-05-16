import PropTypes from 'prop-types'
import React from 'react'
import { Paper, FontIcon, FlatButton } from 'material-ui' //TODO
import { mailboxActions } from 'stores/mailbox'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors' //TODO
import { ConfirmFlatButton } from 'Components/Buttons'

export default class AccountAdvancedSettings extends React.Component {
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
      ...passProps
    } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        {mailbox.supportsAuth ? (
          <div>
            <FlatButton
              label='Reauthenticate'
              icon={<FontIcon className='material-icons'>lock_outline</FontIcon>}
              onClick={() => mailboxActions.reauthenticateMailbox(mailbox.id)} />
          </div>
        ) : undefined}
        <div>
          <ConfirmFlatButton
            key={mailbox.id}
            label='Clear all browsing data'
            confirmLabel='Click again to confirm'
            confirmWaitMs={4000}
            icon={<FontIcon className='material-icons'>clear</FontIcon>}
            confirmIcon={<FontIcon className='material-icons'>help_outline</FontIcon>}
            onConfirmedClick={() => mailboxActions.clearMailboxBrowserSession(mailbox.id)} />
        </div>
        <div>
          <FlatButton
            label='Delete this Account'
            icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
            labelStyle={{color: Colors.red600}}
            onClick={() => {
              window.location.hash = `/mailbox_delete/${mailbox.id}`
            }} />
        </div>
      </Paper>
    )
  }
}
