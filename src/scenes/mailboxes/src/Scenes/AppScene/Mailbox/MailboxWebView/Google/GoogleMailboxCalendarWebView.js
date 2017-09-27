import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import Resolver from 'Runtime/Resolver'
import { mailboxActions, GoogleCalendarServiceReducer } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class GoogleMailboxCalendarWebView extends React.Component {
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
      case WB_BROWSER_NOTIFICATION_PRESENT: this.handleBrowserNotificationPresented(); break
      case WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED: this.handleBrowserAlertPresented(); break
      default: break
    }
  }

  /**
  * Handles the browser presenting a notification or alert
  */
  handleBrowserNotificationPresented = () => {
    mailboxActions.reduceServiceIfInactive(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.CALENDAR,
      GoogleCalendarServiceReducer.notificationPresented
    )
  }

  /**
  * Auto changes the browser active mailbox to this service on presentation
  */
  handleBrowserAlertPresented = () => {
    mailboxActions.changeActive(this.props.mailboxId, CoreService.SERVICE_TYPES.CALENDAR)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={Resolver.guestPreload('googleCalendar')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.CALENDAR}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
