import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountDispatch } from 'stores/account'
import { trelloActions } from 'stores/trello'

const REF = 'mailbox_tab'

export default class TrelloServiceWebView extends React.Component {
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
  }

  componentWillUnmount () {
    // Handle dispatch events
    accountDispatch.removeListener('openItem', this.handleOpenItem)
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
      if (evt.data.boardId && evt.data.cardId) {
        this.refs[REF].loadURL(`https://trello.com/card/board/a/${evt.data.boardId}/${evt.data.cardId}`)
      } else if (evt.data.board) {
        this.refs[REF].loadURL(`https://trello.com/board/a/${evt.data.boardId}`)
      } else {
        this.refs[REF].loadURL('https://trello.com')
      }

      // Normally being able to handle this also indicates that something changed, so lets do a sync
      // after a few seconds to re-evaluate our state
      trelloActions.syncServiceNotificationsAfter.defer(this.props.serviceId, 1000 * 5)
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
