import React from 'react'
import MailboxListItem from '../MailboxListItem'
import PropTypes from 'prop-types'

export default class UnreadMailboxControlListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    requestShowMailboxList: PropTypes.func.isRequired,
    requestSwitchMailbox: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId, requestShowMailboxList, requestSwitchMailbox, ...passProps } = this.props
    return (
      <MailboxListItem
        mailboxId={mailboxId}
        isForwards={false}
        onClick={(evt) => { requestShowMailboxList(evt) }}
        onAvatarClick={(evt) => {
          evt.preventDefault()
          evt.stopPropagation()
          requestSwitchMailbox(evt, mailboxId)
        }}
        {...passProps} />
    )
  }
}
