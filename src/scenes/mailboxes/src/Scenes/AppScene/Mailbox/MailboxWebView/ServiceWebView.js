import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from './MailboxWebViewHibernator'

const REF = 'mailbox_tab'

export default class ServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      mailboxId,
      serviceId
    } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId} />
    )
  }
}
