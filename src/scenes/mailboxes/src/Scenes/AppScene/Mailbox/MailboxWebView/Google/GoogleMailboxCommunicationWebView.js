import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import Resolver from 'Runtime/Resolver'
import { mailboxActions, GoogleCommunicationServiceReducer } from 'stores/mailbox'
import { NotificationService } from 'Notifications'
import {
  WB_BROWSER_GOOGLE_COMMUNICATION_UNREAD_COUNT_CHANGED
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GoogleMailboxCommunicationWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  dispatchBrowserIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_GOOGLE_COMMUNICATION_UNREAD_COUNT_CHANGED:
        this.handleUnreadCountChange(evt.channel.data.prev, evt.channel.data.next)
        break
      default: break
    }
  }

  /**
  * Handles the unread count changing
  * @param prev: the previous count
  * @param next: the next count
  */
  handleUnreadCountChange (prev, next) {
    if (prev !== undefined && next !== undefined) {
      if (next > prev) {
        const diff = next - prev
        NotificationService.processPushedMailboxNotification(this.props.mailboxId, CoreService.SERVICE_TYPES.COMMUNICATION, {
          title: 'New Hangouts Message',
          body: [{ content: `You have ${diff} new message${diff > 1 ? 's' : ''}` }],
          data: {
            mailboxId: this.props.mailboxId,
            serviceType: CoreService.SERVICE_TYPES.COMMUNICATION
          }
        })
      }
    }

    mailboxActions.reduceService(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.COMMUNICATION,
      GoogleCommunicationServiceReducer.setUnreadCount,
      next
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={Resolver.guestPreload('googleCommunication')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.COMMUNICATION}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
