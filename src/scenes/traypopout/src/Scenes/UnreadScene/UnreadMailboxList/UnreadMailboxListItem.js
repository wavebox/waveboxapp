import React from 'react'
import MailboxListItem from '../MailboxListItem'
import PropTypes from 'prop-types'

export default class UnreadMailboxListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    requestShowMailbox: PropTypes.func.isRequired,
    requestSwitchMailbox: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, requestSwitchMailbox, requestShowMailbox, ...passProps } = this.props
    return (
      <MailboxListItem
        mailboxId={mailboxId}
        isForwards
        onClick={(evt) => { requestShowMailbox(evt, mailboxId) }}
        onAvatarClick={(evt) => {
          evt.preventDefault()
          evt.stopPropagation()
          requestSwitchMailbox(evt, mailboxId)
        }}
        {...passProps} />
    )
  }
}
