import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import { settingsStore } from 'stores/settings'
import { MailboxLinker } from 'stores/mailbox'

const REF = 'mailbox_tab'

export default class MicrosoftMailboxServiceWebView extends React.Component {
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
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    MailboxLinker.openExternalWindow(evt.url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceType } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../guest/guestInterface/serviceTooling'
        mailboxId={mailboxId}
        serviceType={serviceType}
        newWindow={settingsStore.getState().launched.app.useExperimentalWindowOpener ? undefined : this.handleOpenNewWindow} />
    )
  }
}
