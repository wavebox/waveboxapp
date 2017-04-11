const React = require('react')
const MailboxWebViewHibernator = require('../MailboxWebViewHibernator')
const CoreService = require('shared/Models/Accounts/CoreService')
const URI = require('urijs')
const { MailboxLinker } = require('stores/mailbox')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailboxCommunicationServiceWebView',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
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
    if (purl.hostname() === 'hangouts.google.com') {
      const pathname = purl.pathname()
      if (pathname.indexOf('/CONVERSATION/') !== -1) {
        MailboxLinker.openContentWindow(url, this.props.mailboxId)
        return
      } else if (pathname.indexOf('/hangouts/_/meet') !== -1) {
        MailboxLinker.openContentWindow(url, this.props.mailboxId)
        return
      }
    }
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
        preload='../platform/webviewInjection/googleServiceTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.COMMUNICATION}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
