import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import URI from 'urijs'
import CoreService from 'shared/Models/Accounts/CoreService'
import { MailboxLinker } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'

const REF = 'mailbox_tab'

export default class GoogleMailboxStorageWebView extends React.Component {
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
    if (purl.hostname() === 'docs.google.com') {
      MailboxLinker.openContentWindow(this.props.mailboxId, CoreService.SERVICE_TYPES.STORAGE, evt.url, evt.options)
    } else {
      MailboxLinker.openExternalWindow(evt.url)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../guest/guestInterface/googleStorageTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.STORAGE}
        newWindow={settingsStore.getState().launched.app.useExperimentalWindowOpener ? undefined : this.handleOpenNewWindow} />
    )
  }
}
