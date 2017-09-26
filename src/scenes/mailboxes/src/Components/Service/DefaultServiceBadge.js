import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore } from 'stores/mailbox'
import ServiceBadge from './ServiceBadge'

export default class DefaultServiceBadge extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isAuthInvalid: PropTypes.bool.isRequired,
    mailboxId: PropTypes.string.isRequired,
    displayMailboxOverview: PropTypes.bool.isRequired,
    badgeStyle: PropTypes.object,
    iconStyle: PropTypes.object
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.mailboxId !== this.props.mailboxId) {
      this.setState(this.generateState(nextProps, undefined))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state
  * @param props: the props to use
  * @param mailboxState=autoget: the mailbox state
  * @return the state object
  */
  generateState (props, mailboxState = mailboxStore.getState()) {
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.defaultService : undefined,
      mailboxUnreadCount: mailboxState.mailboxUnreadCountForUser(props.mailboxId),
      mailboxHasUnreadActivity: mailboxState.mailboxHasUnreadActivityForUser(props.mailboxId)
    }
  }

  state = this.generateState(this.props, undefined)

  mailboxUpdated = (mailboxState) => {
    this.setState(this.generateState(this.props, mailboxState))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      displayMailboxOverview,
      ...passProps
    } = this.props
    const {
      mailbox,
      service,
      mailboxUnreadCount,
      mailboxHasUnreadActivity
    } = this.state

    if (displayMailboxOverview && mailbox.hasAdditionalServices) {
      return (
        <ServiceBadge
          {...passProps}
          supportsUnreadCount={mailbox.showCumulativeSidebarUnreadBadge}
          showUnreadBadge={mailbox.showCumulativeSidebarUnreadBadge}
          unreadCount={mailboxUnreadCount}
          supportsUnreadActivity={mailbox.showCumulativeSidebarUnreadBadge}
          showUnreadActivityBadge={mailbox.showCumulativeSidebarUnreadBadge}
          hasUnreadActivity={mailboxHasUnreadActivity}
          color={mailbox.cumulativeSidebarUnreadBadgeColor} />
      )
    } else {
      return (
        <ServiceBadge
          {...passProps}
          supportsUnreadCount={service.supportsUnreadCount}
          showUnreadBadge={service.showUnreadBadge}
          unreadCount={service.unreadCount}
          supportsUnreadActivity={service.supportsUnreadActivity}
          showUnreadActivityBadge={service.showUnreadActivityBadge}
          hasUnreadActivity={service.hasUnreadActivity}
          color={service.unreadBadgeColor} />
      )
    }
  }
}
