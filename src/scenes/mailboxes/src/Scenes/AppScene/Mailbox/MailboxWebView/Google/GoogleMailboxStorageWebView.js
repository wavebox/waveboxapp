import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'

const REF = 'mailbox_tab'

export default class GoogleMailboxStorageWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={window.guestResolve('preload/googleStorage')}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.STORAGE} />
    )
  }
}
