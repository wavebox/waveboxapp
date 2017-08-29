import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import commonStyles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  mockUnreadActivityIndicator: {
    backgroundColor: Colors.red400,
    color: 'white',
    display: 'inline-block',
    borderRadius: '50%',
    width: 15,
    height: 15,
    lineHeight: '14px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '10px',
    paddingRight: 1
  }
}

export default class AccountBadgeSettings extends React.Component {
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

    const shouldRender = [
      mailbox.supportsUnreadCount,
      mailbox.supportsUnreadActivity
    ].find((f) => f) || false
    if (!shouldRender) { return false }

    return (
      <Paper zDepth={1} style={commonStyles.paper} {...passProps}>
        <h1 style={commonStyles.subheading}>Badges</h1>
        {mailbox.supportsUnreadCount ? (
          <Toggle
            toggled={mailbox.showUnreadBadge}
            label='Show unread badge in sidebar'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowUnreadBadge, toggled)
            }} />
        ) : undefined}
        {mailbox.supportsUnreadActivity ? (
          <Toggle
            toggled={mailbox.showUnreadActivityBadge}
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
            toggled={mailbox.unreadCountsTowardsAppUnread}
            label='Show unread in Menu Bar & App Badge'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setUnreadCountsTowardsAppUnread, toggled)
            }} />
        ) : undefined}
        {mailbox.supportsUnreadActivity ? (
          <Toggle
            toggled={mailbox.unreadActivityCountsTowardsAppUnread}
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
      </Paper>
    )
  }
}
