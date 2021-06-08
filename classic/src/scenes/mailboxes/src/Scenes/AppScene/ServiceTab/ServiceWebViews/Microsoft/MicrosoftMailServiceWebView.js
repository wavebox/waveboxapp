import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebView from '../../CoreServiceWebView'
import { accountStore, accountDispatch, AccountLinker } from 'stores/account'
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
  // Lifecylce
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.webviewRef = React.createRef()
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
    const { serviceId } = this.props
    if (evt.serviceId === serviceId) {
      let currentHostname
      try {
        currentHostname = new URL(this.webviewRef.current.getURL()).hostname
      } catch (ex) { }

      let launchUrl
      if (currentHostname === 'outlook.office365.com') {
        launchUrl = 'https://outlook.office365.com/mail/deeplink/compose'
      } else if (currentHostname === 'outlook.live.com') {
        launchUrl = 'https://outlook.live.com/mail/deeplink/compose'
      } else {
        const auth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
        if (auth) {
          launchUrl = auth.isPersonalAccount
            ? 'https://outlook.live.com/mail/deeplink/compose'
            : 'https://outlook.office365.com/mail/deeplink/compose'
        } else {
          launchUrl = 'https://outlook.live.com/mail/deeplink/compose'
        }
      }

      const qs = querystring.stringify({
        to: evt.data.recipient,
        subject: evt.data.subject,
        body: evt.data.body
      })
      const composeUrl = `${launchUrl}?${qs}`

      // Run this with the correct opener and the window will close after the email is sent :)
      // Make sure you don't try to return the window object - you'll lock all the threads
      this.webviewRef.current.executeJavaScriptOrQueueIfSleeping(`setTimeout(() => {
        window.open('${composeUrl}', '_blank', 'width=800,height=600')
      })`)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebView
        ref={this.webviewRef}
        mailboxId={mailboxId}
        serviceId={serviceId} />
    )
  }
}
