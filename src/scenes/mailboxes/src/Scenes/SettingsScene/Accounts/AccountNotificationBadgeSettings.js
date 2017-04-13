const React = require('react')
const { Paper, Toggle } = require('material-ui')
const { mailboxActions, MailboxReducer } = require('stores/mailbox')
const styles = require('../SettingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  displayName: 'AccountNotificationBadgeSettings',
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
        <h1 style={styles.subheading}>Badges &amp; Notifications</h1>
        <Toggle
          defaultToggled={mailbox.showUnreadBadge}
          label='Show unread badge in sidebar'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setShowUnreadBadge, toggled)
          }} />
        {mailbox.supportsUnreadActivity ? (
          <Toggle
            defaultToggled={mailbox.showUnreadActivityBadge}
            label={(
              <span>
                <span>Show unread activity badge in sidebar as </span>
                <span style={styles.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowUnreadActivityBadge, toggled)
            }} />
        ) : undefined}
        <Toggle
          defaultToggled={mailbox.unreadCountsTowardsAppUnread}
          label='Show unread in Menu Bar & App Badge'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setUnreadCountsTowardsAppUnread, toggled)
          }} />
        {mailbox.supportsUnreadActivity ? (
          <Toggle
            defaultToggled={mailbox.unreadActivityCountsTowardsAppUnread}
            label={(
              <span>
                <span>Show unread activity in Menu Bar & App Badge as </span>
                <span style={styles.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setUnreadActivityCountsTowardsAppUnread, toggled)
            }} />
        ) : undefined}
        <Toggle
          defaultToggled={mailbox.showNotifications}
          label='Show notifications'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduce(mailbox.id, MailboxReducer.setShowNotifications, toggled)
          }} />
      </Paper>
    )
  }
})
