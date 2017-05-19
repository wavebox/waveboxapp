import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxDispatch, MailboxLinker } from 'stores/mailbox'
import { microsoftActions } from 'stores/microsoft'
import URI from 'urijs'

const REF = 'mailbox_tab'

export default class MicrosoftMailboxMailWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Handle dispatch events
    mailboxDispatch.on('openItem', this.handleOpenItem)
  }

  componentWillUnmount () {
    // Handle dispatch events
    mailboxDispatch.removeListener('openItem', this.handleOpenItem)
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem (evt) {
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      if (evt.data.webLink) {
        MailboxLinker.openContentWindow(this.props.mailboxId, evt.data.webLink)
        // Normally being able to handle this also indicates that something changed, so lets do a sync
        // after a few seconds to re-evaluate our state
        microsoftActions.syncMailboxMailAfter.defer(this.props.mailboxId, 1000 * 5)
      }
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Opens a new url in the correct way
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const url = URI(evt.url)
    if (url.hostname() === 'attachment.outlook.office.net' && url.pathname().endsWith('GetFileAttachment')) {
      this.refs[REF].getWebContents().downloadURL(evt.url)
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
        preload='../platform/webviewInjection/serviceTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={this.handleOpenNewWindow} />
    )
  }
}
