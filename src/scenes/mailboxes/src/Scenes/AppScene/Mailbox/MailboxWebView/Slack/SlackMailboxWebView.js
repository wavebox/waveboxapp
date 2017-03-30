const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const CoreService = require('shared/Models/Accounts/CoreService')
const { mailboxDispatch, mailboxStore, MailboxLinker } = require('stores/mailbox')
const URI = require('urijs')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SlackMailboxWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
    mailboxDispatch.on('openItem', this.handleOpenItem)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
    mailboxDispatch.removeListener('openItem', this.handleOpenItem)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.replaceState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    return {
      mailbox: mailboxStore.getState().getMailbox(props.mailboxId)
    }
  },

  mailboxUpdated (mailboxState) {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.mailboxId)
    })
  },

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem (evt) {
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      const service = this.state.mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT)
      if (evt.data.channelId) {
        const url = URI(service.url).pathname('/messages/' + evt.data.channelId).toString()
        this.refs[REF].loadURL(url)
      } else {
        this.refs[REF].loadURL(service.url)
      }
    }
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/serviceTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
