import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, FlatButton, FontIcon } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

export default class AccountAdvancedSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.confirmingDeleteTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.confirmingDeleteTO)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState({ confirmingDelete: false })
      clearTimeout(this.confirmingDeleteTO)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      confirmingDelete: false
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the delete button being tapped
  */
  handleDeleteTapped = (evt) => {
    if (this.state.confirmingDelete) {
      this.setState({ confirmingDelete: false })
      mailboxActions.remove(this.props.mailbox.id)
    } else {
      this.setState({ confirmingDelete: true })
      clearTimeout(this.confirmingDeleteTO)
      this.confirmingDeleteTO = setTimeout(() => {
        this.setState({ confirmingDelete: false })
      }, 4000)
    }
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
        <FlatButton
          label={this.state.confirmingDelete ? 'Click again to confirm' : 'Delete this Account'}
          icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
          labelStyle={{color: Colors.red600}}
          onTouchTap={this.handleDeleteTapped} />
      </Paper>
    )
  }
}
