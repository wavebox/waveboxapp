const React = require('react')
const { Paper, SelectField, MenuItem, Toggle } = require('material-ui')
const { mailboxActions, MailboxReducer } = require('stores/mailbox')
const styles = require('../SettingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountServicesSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Services</h1>
        <p style={styles.subheadingInfo}>
          Your account is split into seperate services, for example Email,
          Storage & Contacts. You can enable, disable & change
          the way these behave
        </p>
        <SelectField
          fullWidth
          floatingLabelText='Where should services be displayed?'
          value={mailbox.serviceDisplayMode}
          onChange={(evt, index, mode) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceDisplayMode, mode)
          }}>
          <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR} primaryText='Left Sidebar' />
          <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR} primaryText='Top Toolbar' />
        </SelectField>
        <Toggle
          toggled={mailbox.collapseSidebarServices}
          disabled={mailbox.serviceDisplayMode !== CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR}
          label='Collapse sidebar services when mailbox is inactive'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setCollapseSidebarServices, toggled)
          }} />
      </Paper>
    )
  }
})
