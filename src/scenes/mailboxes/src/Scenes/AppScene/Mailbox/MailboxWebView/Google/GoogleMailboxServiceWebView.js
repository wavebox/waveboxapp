import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import { settingsStore } from 'stores/settings'
import { MailboxLinker } from 'stores/mailbox'
import URI from 'urijs'

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
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const purl = URI(evt.url)
    if (purl.hostname() === 'docs.google.com') {
      MailboxLinker.openContentWindow(this.props.mailboxId, this.props.serviceType, evt.url, evt.options)
    } else {
      MailboxLinker.openExternalWindow(evt.url)
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
        newWindow={settingsStore.getState().launched.app.useExperimentalWindowOpener ? undefined : this.handleOpenNewWindow}
        serviceType={serviceType} />
    )
  }
}
