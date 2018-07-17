import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountStore, accountDispatch } from 'stores/account'
import { googleActions } from 'stores/google'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_WINDOW_ICONS_IN_SCREEN,
  WB_BROWSER_OPEN_MESSAGE,
  WB_BROWSER_COMPOSE_MESSAGE,
  WB_BROWSER_GOOGLE_INBOX_TOP_MESSAGE_CHANGED,
  WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED
} from 'shared/ipcEvents'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

const REF = 'mailbox_tab'

export default class GoogleMailServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    accountDispatch.on('openItem', this.handleOpenItem)
    accountDispatch.on('composeItem', this.handleComposeMessage)
  }

  componentWillUnmount () {
    // Stores
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    accountDispatch.removeListener('openItem', this.handleOpenItem)
    accountDispatch.removeListener('composeItem', this.handleComposeMessage)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      const service = accountState.getService(nextProps.serviceId)
      this.setState({
        serviceType: service ? service.type : undefined,
        isActive: accountState.isServiceActive(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/
  state = (() => {
    const settingsState = settingsStore.getState()
    const accountState = accountStore.getState()
    const service = accountState.getService(this.props.serviceId)

    return {
      serviceType: service ? service.type : undefined,
      isActive: accountState.isServiceActive(this.props.serviceId),
      ui: settingsState.ui
    }
  })()

  accountChanged = (accountState) => {
    const service = accountState.getService(this.props.serviceId)
    this.setState({
      serviceType: service ? service.type : undefined,
      isActive: accountState.isServiceActive(this.props.serviceId)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState((prevState) => {
      const update = { ui: settingsState.ui }

      // Siphon settings down to webview
      if (process.platform === 'darwin') {
        const prevIconsInscreen = !prevState.ui.sidebarEnabled && !prevState.ui.showTitlebar
        const nextIconsInscreen = !settingsState.ui.sidebarEnabled && !settingsState.ui.showTitlebar
        if (prevIconsInscreen !== nextIconsInscreen) {
          try {
            this.refs[REF].send(WB_BROWSER_WINDOW_ICONS_IN_SCREEN, { inscreen: nextIconsInscreen })
          } catch (ex) {
            console.warn(ex)
          }
        }
      }

      return update
    })
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      this.refs[REF].sendOrQueueIfSleeping(WB_BROWSER_OPEN_MESSAGE, {
        messageId: evt.data.messageId,
        threadId: evt.data.threadId,
        search: evt.data.search
      })
    }
  }

  /**
  * Handles composing a new message
  * @param evt: the event that fired
  */
  handleComposeMessage = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      this.refs[REF].sendOrQueueIfSleeping(WB_BROWSER_COMPOSE_MESSAGE, {
        recipient: evt.data.recipient,
        subject: evt.data.subject,
        body: evt.data.body
      })
    }
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
      case WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED: this.handleIPCUnreadCountChanged(evt.channel.data); break
      case WB_BROWSER_GOOGLE_INBOX_TOP_MESSAGE_CHANGED: this.handleIPCTopMessageChanged(evt.channel.data); break
      default: break
    }
  }

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady = () => {
    // UI Fixes
    const ui = this.state.ui
    this.refs[REF].send(WB_BROWSER_WINDOW_ICONS_IN_SCREEN, {
      inscreen: !ui.sidebarEnabled && !ui.showTitlebar && process.platform === 'darwin'
    })
  }

  /**
  * Handles the unread count changing as per the ipc event
  */
  handleIPCUnreadCountChanged = (evt) => {
    googleActions.mailCountPossiblyChanged(this.props.serviceId, evt.next)
  }

  /**
  * Handles the top message changing as per the ipc event
  */
  handleIPCTopMessageChanged = (evt) => {
    googleActions.syncServiceMessages(this.props.serviceId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.isActive !== this.state.isActive) {
      if (this.state.isActive) {
        // Try to get the UI to reload to show when we make this item active
        if (this.state.serviceType === SERVICE_TYPES.GOOGLE_MAIL) {
          this.refs[REF].executeJavaScript(`
            document.querySelector('[href*="mail.google"][href*="' + window.location.hash + '"]').click()
          `, true)
        } else if (this.state.serviceType === SERVICE_TYPES.GOOGLE_INBOX) {
          this.refs[REF].executeJavaScript(`
            document.querySelector('[jsaction="global.navigate"][tabIndex="0"]').click()
          `, true)
        }
      }
    }
  }

  render () {
    const { mailboxId, serviceId } = this.props
    return (
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        domReady={this.handleBrowserDomReady}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
