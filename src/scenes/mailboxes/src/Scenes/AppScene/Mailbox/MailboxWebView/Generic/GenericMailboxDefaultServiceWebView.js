const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const CoreService = require('shared/Models/Accounts/CoreService')
const { MailboxLinker, mailboxStore } = require('stores/mailbox')
const shallowCompare = require('react-addons-shallow-compare')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GenericMailboxDefaultServiceWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecycle
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
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const mailbox = mailboxStore.getState().getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    return {
      url: service ? service.url : undefined
    }
  },

  mailboxChanged (mailboxState) {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    this.setState({
      url: service ? service.url : undefined
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailboxId } = this.props
    const { url } = this.state

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/serviceTooling'
        mailboxId={mailboxId}
        url={url}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
