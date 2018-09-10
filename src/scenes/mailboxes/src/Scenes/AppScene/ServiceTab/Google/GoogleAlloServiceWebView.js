import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountActions } from 'stores/account'
import GoogleAlloServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/GoogleAlloServiceDataReducer'
import {
  WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GoogleAlloServiceWebView extends React.Component {
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
    accountActions.reduceServiceData(
      this.props.serviceId,
      GoogleAlloServiceDataReducer.setUnreadCount,
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
