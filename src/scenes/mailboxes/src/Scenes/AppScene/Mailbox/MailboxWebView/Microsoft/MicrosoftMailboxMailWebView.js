import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxDispatch, MailboxLinker } from 'stores/mailbox'
import { microsoftActions } from 'stores/microsoft'

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
  handleOpenItem = (evt) => {
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      if (evt.data.webLink) {
        MailboxLinker.openContentWindow(this.props.mailboxId, CoreService.SERVICE_TYPES.DEFAULT, evt.data.webLink)
        // Normally being able to handle this also indicates that something changed, so lets do a sync
        // after a few seconds to re-evaluate our state
        microsoftActions.syncMailboxMailAfter.defer(this.props.mailboxId, 1000 * 5)
      }
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
        preload={window.guestResolve('serviceTooling')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT} />
    )
  }
}
