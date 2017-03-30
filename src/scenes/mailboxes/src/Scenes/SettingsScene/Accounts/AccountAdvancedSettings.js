const React = require('react')
const { Paper, Toggle, FlatButton, FontIcon } = require('material-ui')
const { mailboxActions, MailboxReducer } = require('stores/mailbox')
const styles = require('../SettingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Colors = require('material-ui/styles/colors')
const TimerMixin = require('react-timer-mixin')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountAdvancedSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },
  mixins: [TimerMixin],

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.confirmingDeleteTO = null
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState({ confirmingDelete: false })
      this.clearTimeout(this.confirmingDeleteTO)
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      confirmingDelete: false
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the delete button being tapped
  */
  handleDeleteTapped (evt) {
    if (this.state.confirmingDelete) {
      this.setState({ confirmingDelete: false })
      mailboxActions.remove(this.props.mailbox.id)
    } else {
      this.setState({ confirmingDelete: true })
      this.confirmingDeleteTO = this.setTimeout(() => {
        this.setState({ confirmingDelete: false })
      }, 4000)
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, showRestart, ...passProps } = this.props

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
        <FlatButton
          label={this.state.confirmingDelete ? 'Click again to confirm' : 'Delete this Account'}
          icon={<FontIcon color={Colors.red600} className='material-icons'>delete</FontIcon>}
          labelStyle={{color: Colors.red600}}
          onTouchTap={this.handleDeleteTapped} />
      </Paper>
    )
  }
})
