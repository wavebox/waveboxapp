import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxStore, mailboxDispatch, MailboxLinker } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import URI from 'urijs'

const REF = 'mailbox_tab'

export default class GoogleMailboxMailWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    mailboxStore.listen(this.mailboxChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.on('openItem', this.handleOpenItem)
    mailboxDispatch.on('composeItem', this.handleComposeMessage)
  }

  componentWillUnmount () {
    // Stores
    mailboxStore.unlisten(this.mailboxChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.removeListener('openItem', this.handleOpenItem)
    mailboxDispatch.removeListener('composeItem', this.handleComposeMessage)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const settingsState = settingsStore.getState()
    const mailboxState = mailboxStore.getState()
    return {
      mailbox: mailboxState.getMailbox(props.mailboxId),
      ui: settingsState.ui
    }
  }

  mailboxChanged = (mailboxState) => {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.mailboxId)
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
            this.refs[REF].send('window-icons-in-screen', { inscreen: nextIconsInscreen })
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
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      this.refs[REF].send('open-message', {
        messageId: evt.data.messageId, threadId: evt.data.threadId
      })
    }
  }

  /**
  * Handles composing a new message
  * @param evt: the event that fired
  */
  handleComposeMessage = (evt) => {
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      this.refs[REF].send('compose-message', {
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
      case 'js-new-window': this.handleOpenNewWindow({ url: evt.channel.url }); break
      default: break
    }
  }

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady = () => {
    // UI Fixes
    const ui = this.state.ui
    this.refs[REF].send('window-icons-in-screen', {
      inscreen: !ui.sidebarEnabled && !ui.showTitlebar && process.platform === 'darwin'
    })
  }

  /**
  * Opens a new url in the correct way
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const purl = URI(evt.url)
    if (purl.hostname() === 'inbox.google.com') {
      this.setState({ url: evt.url })
    } else if (purl.hostname() === 'mail.google.com') {
      const query = purl.search(true)
      if (query.ui === '2' || query.view === 'om') {
        MailboxLinker.openContentWindow(this.props.mailboxId, evt.url, evt.options)
      } else {
        this.setState({ url: evt.url })
      }
    } else if (purl.hostname() === 'drive.google.com') {
      MailboxLinker.openContentWindow(this.props.mailboxId, evt.url, evt.options)
    } else {
      MailboxLinker.openExternalWindow(evt.url)
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
        preload='../platform/webviewInjection/googleMailTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={this.handleOpenNewWindow}
        domReady={this.handleBrowserDomReady}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
}
