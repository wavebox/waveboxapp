import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import Resolver from 'Runtime/Resolver'
import { mailboxActions, GoogleMessengerServiceReducer } from 'stores/mailbox'
import {
  WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED
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
      case WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED:
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
    mailboxActions.reduceService(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.MESSENGER,
      GoogleMessengerServiceReducer.setUnreadCount,
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
        preload={Resolver.guestPreload('googleMessenger')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.MESSENGER}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
