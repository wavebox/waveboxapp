import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, FontIcon, SelectField, MenuItem } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import { ConfirmFlatButton } from 'Components/Buttons'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

const humanizedOpenModes = {
  [CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER]: 'Default Browser',
  [CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX]: 'Wavebox Browser'
}

export default class AccountAdvancedSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired,
    windowOpenBefore: PropTypes.node,
    windowOpenAfter: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the cookie settings
  * @param mailbox: the mailbox to render for
  * @param showRestart: fn to call to show restart
  * @return jsx
  */
  renderCookieSettings (mailbox, showRestart) {
    return (
      <div>
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
      </div>
    )
  }

  /**
  * Renders the window open settings
  * @param mailbox: the mailbox to render for
  * @param windowOpenBefore: elements to add before the settings
  * @param windowOpenAfter: elements to add after the settings
  * @return jsx
  */
  renderWindowOpenSettings (mailbox, windowOpenBefore, windowOpenAfter) {
    return (
      <div>
        {windowOpenBefore}
        <SelectField
          floatingLabelText='Open new windows in which Browser'
          value={mailbox.defaultWindowOpenMode}
          floatingLabelFixed
          fullWidth
          onChange={(evt, index, value) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setDefaultWindowOpenMode, value)
          }}>
          {Object.keys(CoreMailbox.DEFAULT_WINDOW_OPEN_MODES).map((mode) => {
            return (<MenuItem key={mode} value={mode} primaryText={humanizedOpenModes[mode]} />)
          })}
        </SelectField>
        {windowOpenAfter}
      </div>
    )
  }

  /**
  * Renders the destructive actions
  * @param mailbox: the mailbox to render for
  * @return jsx
  */
  renderDestructiveActions (mailbox) {
    return (
      <div>
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
      </div>
    )
  }

  render () {
    const {
      mailbox,
      children,
      showRestart,
      windowOpenBefore,
      windowOpenAfter,
      ...passProps
    } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Advanced</h1>
        {this.renderCookieSettings(mailbox, showRestart)}
        <br />
        {this.renderWindowOpenSettings(mailbox, windowOpenBefore, windowOpenAfter)}
        <br />
        {children}
        {this.renderDestructiveActions(mailbox)}
      </Paper>
    )
  }
}
