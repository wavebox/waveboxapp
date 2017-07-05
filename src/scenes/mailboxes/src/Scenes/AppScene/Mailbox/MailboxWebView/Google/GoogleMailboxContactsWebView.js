import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import URI from 'urijs'
import { MailboxLinker } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'

const REF = 'mailbox_tab'

export default class GoogleMailboxContactsWebView extends React.Component {
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
    if (purl.hostname() === 'mail.google.com' && purl.search(true).to !== undefined) {
      return // This is normally followed by a call with mailto://, so just kill it
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
        preload={window.guestResolve('googleServiceTooling')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.CONTACTS}
        newWindow={settingsStore.getState().launched.app.useExperimentalWindowOpener ? undefined : this.handleOpenNewWindow} />
    )
  }
}
