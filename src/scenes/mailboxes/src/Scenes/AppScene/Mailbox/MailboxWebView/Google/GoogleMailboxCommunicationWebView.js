import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import Resolver from 'Runtime/Resolver'
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
        break
      default: break
    }
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
