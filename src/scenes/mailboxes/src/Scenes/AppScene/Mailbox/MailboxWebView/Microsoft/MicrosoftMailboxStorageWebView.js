import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import Resolver from 'Runtime/Resolver'

const REF = 'mailbox_tab'

export default class MicrosoftMailboxStorageWebView extends React.Component {
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
        preload={Resolver.guestPreload('microsoftStorage')}
        mailboxId={mailboxId}
        serviceType={CoreMailbox.SERVICE_TYPES.STORAGE}
        allowpopups={false} />
    )
  }
}
