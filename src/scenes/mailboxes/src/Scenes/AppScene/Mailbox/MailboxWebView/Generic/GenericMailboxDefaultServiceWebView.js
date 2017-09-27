import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import { mailboxStore, mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME
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
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    return {
      defaultWindowOpenMode: mailbox ? mailbox.defaultWindowOpenMode : CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX,
      url: service ? service.url : undefined
    }
  }

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    this.setState({
      defaultWindowOpenMode: mailbox ? mailbox.defaultWindowOpenMode : CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX,
      url: service ? service.url : undefined
    })
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
      case WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME: this.refs[REF].loadURL(this.state.url); break
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
    const { url } = this.state

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={Resolver.guestPreload('genericDefaultService')}
        mailboxId={mailboxId}
        url={url}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        didChangeThemeColor={this.handleThemeColorChanged}
        pageTitleUpdated={this.handlePageTitleUpdated}
        pageFaviconUpdated={this.handlePageFaviconUpdated}
        ipcMessage={this.handleIPCMessage} />
    )
  }
}
