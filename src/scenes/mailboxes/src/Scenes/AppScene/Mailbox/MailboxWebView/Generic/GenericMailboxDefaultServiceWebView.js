import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'

const REF = 'mailbox_tab'

export default class GenericMailboxDefaultServiceWebView extends React.Component {
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
  * Handles the theme color changing
  * @param evt: the event that fired
  */
  handleThemeColorChanged = (evt) => {
    mailboxActions.reduce(this.props.mailboxId, GenericMailboxReducer.setPageThemeColor, evt.themeColor)
  }

  /**
  * Handles the page favicon updating
  * @param evt: the event that fired
  */
  handlePageTitleUpdated = (evt) => {
    mailboxActions.reduce(this.props.mailboxId, GenericMailboxReducer.setPageTitle, evt.title)
  }

  /**
  * Handles the page favicon updating
  * @param evt: the event that fired
  */
  handlePageFaviconUpdated = (evt) => {
    mailboxActions.reduce(this.props.mailboxId, GenericMailboxReducer.setPageFavicon, evt.favicons)
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
  * Handles the browser presenting a notification
  */
  handleBrowserNotificationPresented = () => {
    mailboxActions.reduceServiceIfInactive(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.DEFAULT,
      GenericDefaultServiceReducer.notificationPresented
    )
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
        preload={Resolver.guestPreload()}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        didChangeThemeColor={this.handleThemeColorChanged}
        pageTitleUpdated={this.handlePageTitleUpdated}
        pageFaviconUpdated={this.handlePageFaviconUpdated}
        ipcMessage={this.handleIPCMessage} />
    )
  }
}
