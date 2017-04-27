import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import URI from 'urijs'
import { MailboxLinker } from 'stores/mailbox'

const REF = 'mailbox_tab'

export default class GoogleMailboxCommunicationServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
  }

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
}
