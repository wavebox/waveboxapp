import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import URI from 'urijs'
import { MailboxLinker } from 'stores/mailbox'

const REF = 'mailbox_tab'

export default class GoogleMailboxCommunicationWebView extends React.Component {
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
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const purl = URI(evt.url)
    if (purl.hostname() === 'hangouts.google.com') {
      const pathname = purl.pathname()
      if (pathname.indexOf('/CONVERSATION/') !== -1) {
        MailboxLinker.openContentWindow(this.props.mailboxId, evt.url, evt.options)
        return
      } else if (pathname.indexOf('/hangouts/_/meet') !== -1) {
        MailboxLinker.openContentWindow(this.props.mailboxId, evt.url, evt.options)
        return
      }
    }

    MailboxLinker.openExternalWindow(evt.url)
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
        newWindow={this.handleOpenNewWindow} />
    )
  }
}
