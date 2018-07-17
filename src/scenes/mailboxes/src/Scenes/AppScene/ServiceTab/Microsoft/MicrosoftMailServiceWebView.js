import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountDispatch, AccountLinker } from 'stores/account'
import { microsoftActions } from 'stores/microsoft'

const REF = 'mailbox_tab'

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
    // Note we can't support the full set of compose here because microsoft blocks automated
    // inputs. Instead we do the best we can - which is bringing up the compose window
    if (evt.serviceId === this.props.serviceId) {
      this.refs[REF].getWebContents().sendInputEvent({
        type: 'keyDown',
        keyCode: 'N',
        modifiers: process.platform === 'darwin' ? ['meta'] : ['control']
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId} />
    )
  }
}
