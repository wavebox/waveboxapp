import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountActions } from 'stores/account'
import GoogleCalendarServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/GoogleCalendarServiceDataReducer'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GoogleCalendarServiceWebView extends React.Component {
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
      case WB_BROWSER_NOTIFICATION_PRESENT: this.handleBrowserNotificationPresented(); break
      case WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED: this.handleBrowserAlertPresented(); break
      default: break
    }
  }

  /**
  * Handles the browser presenting a notification or alert
  */
  handleBrowserNotificationPresented = () => {
    accountActions.reduceServiceDataIfInactive(
      this.props.serviceId,
      GoogleCalendarServiceDataReducer.notificationPresented
    )
  }

  /**
  * Auto changes the browser active mailbox to this service on presentation
  */
  handleBrowserAlertPresented = () => {
    accountActions.changeActiveService(this.props.serviceId)
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
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
