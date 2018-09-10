import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountActions } from 'stores/account'
import GoogleHangoutsServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/GoogleHangoutsServiceDataReducer'
import { NotificationService } from 'Notifications'
import {
  WB_BROWSER_GOOGLE_COMMUNICATION_UNREAD_COUNT_CHANGED
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GoogleHangoutsServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
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
    const { mailboxId, serviceId } = this.props
    if (prev !== undefined && next !== undefined) {
      if (next > prev) {
        const diff = next - prev
        NotificationService.processPushedMailboxNotification(mailboxId, serviceId, {
          title: 'New Hangouts Message',
          body: [{ content: `You have ${diff} new message${diff > 1 ? 's' : ''}` }],
          data: {
            mailboxId: mailboxId,
            serviceId: serviceId
          }
        })
      }
    }

    accountActions.reduceServiceData(
      serviceId,
      GoogleHangoutsServiceDataReducer.setUnreadCount,
      next
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceId } = this.props
    return (
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
