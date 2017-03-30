const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const URI = require('urijs')
const { MailboxLinker } = require('stores/mailbox')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailboxServiceWebView',
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
    const purl = URI(url)
    if (purl.hostname() === 'docs.google.com') {
      MailboxLinker.openContentWindow(url, this.props.mailboxId)
    } else {
      MailboxLinker.openExternalWindow(url)
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceType } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/googleServiceTooling'
        mailboxId={mailboxId}
        serviceType={serviceType}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
