import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class AccountNotificationBadgeSettings extends React.Component {
  /* **************************************************************************/
  // Lifecycle
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
    const { mailbox, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Badges &amp; Notifications</h1>
        {mailbox.supportsUnreadCount ? (
          <Toggle
            defaultToggled={mailbox.showUnreadBadge}
            label='Show unread badge in sidebar'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowUnreadBadge, toggled)
            }} />
        ) : undefined}
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
        {mailbox.supportsUnreadCount ? (
          <Toggle
            defaultToggled={mailbox.unreadCountsTowardsAppUnread}
            label='Show unread in Menu Bar & App Badge'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setUnreadCountsTowardsAppUnread, toggled)
            }} />
        ) : undefined}
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
        {mailbox.supportsNativeNotifications ? (
          <Toggle
            defaultToggled={mailbox.showNotifications}
            label='Show notifications'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowNotifications, toggled)
            }} />
        ) : undefined}
      </Paper>
    )
  }
}
