import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'

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
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceType } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={window.guestResolve('googleServiceTooling')}
        mailboxId={mailboxId}
        serviceType={serviceType} />
    )
  }
}
