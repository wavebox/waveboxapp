import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxStore, mailboxDispatch, MailboxLinker } from 'stores/mailbox'
import { googleActions } from 'stores/google'
import { settingsStore } from 'stores/settings'
import URI from 'urijs'
import shallowCompare from 'react-addons-shallow-compare'

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
      isActive: mailboxState.isActive(props.mailboxId, CoreService.SERVICE_TYPES.DEFAULT),
      ui: settingsState.ui
    }
  }

  mailboxChanged = (mailboxState) => {
    const { mailboxId } = this.props
    this.setState({
      mailbox: mailboxState.getMailbox(mailboxId),
      isActive: mailboxState.isActive(mailboxId, CoreService.SERVICE_TYPES.DEFAULT)
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
      case 'unread-count-changed': this.handleIPCUnreadCountChanged(evt.channel.data); break
      case 'top-message-changed': this.handleIPCTopMessageChanged(evt.channel.data); break
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

  /**
  * Handles the unread count changing as per the ipc event
  */
  handleIPCUnreadCountChanged = (evt) => {
    googleActions.mailCountChanged(this.props.mailboxId, evt.next)
  }

  /**
  * Handles the top message changing as per the ipc event
  */
  handleIPCTopMessageChanged = (evt) => {
    googleActions.syncMailboxMessages(this.props.mailboxId)
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
        const service = this.state.mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT)
        if (service) {
          // Try to get the UI to reload to show when we make this item active
          if (service.accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
            this.refs[REF].executeJavaScript(`
              document.querySelector('[href*="mail.google"][href*="' + window.location.hash + '"]').click()
            `, true)
          } else if (service.accessMode === GoogleDefaultService.ACCESS_MODES.INBOX) {
            this.refs[REF].executeJavaScript(`
              document.querySelector('[jsaction="global.navigate"][tabIndex="0"]').click()
            `, true)
          }
        }
      }
    }
  }

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
