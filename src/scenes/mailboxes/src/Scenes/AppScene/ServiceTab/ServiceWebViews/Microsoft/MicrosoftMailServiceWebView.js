import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebView from '../../CoreServiceWebView'
import { accountDispatch, AccountLinker } from 'stores/account'
import { microsoftActions } from 'stores/microsoft'
import querystring from 'querystring'

export default class MicrosoftMailServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Handle dispatch events
    accountDispatch.on('openItem', this.handleOpenItem)
    accountDispatch.on('composeItem', this.handleComposeMessage)
  }

  componentWillUnmount () {
    // Handle dispatch events
    accountDispatch.removeListener('openItem', this.handleOpenItem)
    accountDispatch.removeListener('composeItem', this.handleComposeMessage)
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      if (evt.data.webLink) {
        AccountLinker.openContentWindow(this.props.serviceId, evt.data.webLink)
        // Normally being able to handle this also indicates that something changed, so lets do a sync
        // after a few seconds to re-evaluate our state
        microsoftActions.syncServiceMailAfter.defer(this.props.serviceId, 1000 * 5)
      }
    }
  }

  /**
  * Handles composing a new message
  * @param evt: the event that fired
  */
  handleComposeMessage = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      const qs = querystring.stringify({
        to: evt.data.recipient,
        subject: evt.data.subject,
        body: evt.data.body
      })
      AccountLinker.openContentWindow(this.props.serviceId, `https://outlook.live.com/mail/deeplink/compose?${qs}`, {
        width: 800,
        height: 600
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebView mailboxId={mailboxId} serviceId={serviceId} />
    )
  }
}
