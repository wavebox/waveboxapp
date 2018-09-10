import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountActions } from 'stores/account'
import GenericServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/GenericServiceDataReducer'
import GenericServiceReducer from 'shared/AltStores/Account/ServiceReducers/GenericServiceReducer'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GenericServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Browser Events : Dispatcher
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  handleIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT: this.handleBrowserNotificationPresented(); break
      default: break
    }
  }

  /**
  * Handles the page favicon being updated
  * @param evt: the event that fired
  */
  handleFaviconUpdated = (evt) => {
    accountActions.reduceService(
      this.props.serviceId,
      GenericServiceReducer.setPageFaviconAvatar,
      evt.favicons
    )
  }

  /**
  * Handles the browser presenting a notification
  */
  handleBrowserNotificationPresented = () => {
    accountActions.reduceServiceDataIfInactive(
      this.props.serviceId,
      GenericServiceDataReducer.notificationPresented
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        pageFaviconUpdated={this.handleFaviconUpdated}
        ipcMessage={this.handleIPCMessage} />
    )
  }
}
