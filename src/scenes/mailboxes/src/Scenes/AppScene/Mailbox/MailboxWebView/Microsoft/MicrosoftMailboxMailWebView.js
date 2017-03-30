const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const CoreService = require('shared/Models/Accounts/CoreService')
const { mailboxDispatch, MailboxLinker } = require('stores/mailbox')
const { microsoftActions } = require('stores/microsoft')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MicrosoftMailboxMailbWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Handle dispatch events
    mailboxDispatch.on('openItem', this.handleOpenItem)
  },

  componentWillUnmount () {
    // Handle dispatch events
    mailboxDispatch.removeListener('openItem', this.handleOpenItem)
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
      if (evt.data.webLink) {
        MailboxLinker.openContentWindow(evt.data.webLink, this.props.mailboxId)
        // Normally being able to handle this also indicates that something changed, so lets do a sync
        // after a few seconds to re-evaluate our state
        microsoftActions.syncMailboxMailAfter.defer(this.props.mailboxId, 1000 * 5)
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
