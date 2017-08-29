import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, FontIcon } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import { ConfirmFlatButton } from 'Components/Buttons'

export default class AccountAdvancedSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, children, showRestart, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Advanced</h1>
        <Toggle
          toggled={mailbox.artificiallyPersistCookies}
          label='Artificially Persist Cookies. (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            mailboxActions.reduce(mailbox.id, MailboxReducer.setArtificiallyPersistCookies, toggled)
          }} />
        <div style={{color: Colors.grey500}}>
          <small>
            <span>
              Not recommended for most users but helpful if you are signed out every restart. If you enable
              this, you may need be logged out and need to&nbsp;
            </span>
            <a
              href={mailbox.artificiallyPersistCookies ? '#' : undefined}
              disabled={!mailbox.artificiallyPersistCookies}
              onClick={(evt) => {
                evt.preventDefault()
                if (mailbox.artificiallyPersistCookies) {
                  mailboxActions.reauthenticateBrowserSession(mailbox.id, mailbox.partition)
                }
              }}>
              Reauthenticate your account manually
            </a>
          </small>
        </div>
        <br />
        {children}
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
          <ConfirmFlatButton
            key={mailbox.id}
            label='Delete this Account'
            confirmLabel='Click again to confirm'
            confirmWaitMs={4000}
            icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
            confirmIcon={<FontIcon color={Colors.red600} className='material-icons'>help_outline</FontIcon>}
            labelStyle={{color: Colors.red600}}
            onConfirmedClick={() => mailboxActions.remove(mailbox.id)} />
        </div>
      </Paper>
    )
  }
}
