const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const { MailboxLinker, mailboxStore } = require('stores/mailbox')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const URI = require('urijs')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MicrosoftMailboxStorageServiceWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.replaceState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.STORAGE) : null
    }
  },

  mailboxChanged (mailboxState) {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.STORAGE) : null
    })
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Opens a new url in the correct way
  * @param url: the url to open
  */
  handleOpenNewWindow (url) {
    MailboxLinker.openExternalWindow(url)
  },

  /**
  * Re-captures the navigate urls to open them the correct way if required
  * @param evt: the event that fired
  */
  handleWillNavigate (evt) {
    const purl = URI(evt.url)
    let contentWindow = false

    // Outlook
    if (purl.hostname() === 'onedrive.live.com') {
      if (purl.pathname() === '/edit.aspx') {
        contentWindow = true
      }
    } else if (purl.hostname().endsWith('.files.1drv.com')) {
      contentWindow = true
    }

    // Office 365
    if (purl.hostname().endsWith('.sharepoint.com')) {
      if (purl.pathname().endsWith('WopiFrame.aspx')) {
        contentWindow = true
      }
    }

    if (contentWindow) {
      MailboxLinker.openContentWindow(evt.url, this.props.mailboxId)
      const webviewDOM = this.refs[REF].getWebviewNode()
      webviewDOM.stop()
      webviewDOM.loadURL(this.state.service.url)
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/microsoftStorageServiceTooling'
        mailboxId={mailboxId}
        serviceType={CoreMailbox.SERVICE_TYPES.STORAGE}
        willNavigate={this.handleWillNavigate}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
