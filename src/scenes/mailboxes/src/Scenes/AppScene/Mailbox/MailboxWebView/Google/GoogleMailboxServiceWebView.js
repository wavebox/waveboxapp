import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import URI from 'urijs'
import { MailboxLinker } from 'stores/mailbox'

const REF = 'mailbox_tab'

export default class GoogleMailboxServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired
  }

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
  }

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
}
