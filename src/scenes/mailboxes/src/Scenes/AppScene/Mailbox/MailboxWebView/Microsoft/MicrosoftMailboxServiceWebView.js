const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const { MailboxLinker } = require('stores/mailbox')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MicrosoftMailboxServiceWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired,
    serviceType: React.PropTypes.string.isRequired
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
    const { mailboxId, serviceType } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/serviceTooling'
        mailboxId={mailboxId}
        serviceType={serviceType}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
