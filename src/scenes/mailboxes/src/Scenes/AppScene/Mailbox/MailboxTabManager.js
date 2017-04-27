import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import { userStore } from 'stores/user'
import Welcome from '../Welcome/Welcome'
import MailboxTab from './MailboxTab'

export default class MailboxTabManager extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    const userState = userStore.getState()
    return {
      mailboxIds: mailboxState.unrestrictedMailboxIds(userState.user)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    const userState = userStore.getState()
    this.setState({
      mailboxIds: mailboxState.unrestrictedMailboxIds(userState.user)
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      mailboxIds: mailboxState.unrestrictedMailboxIds(userState.user)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }

    return false
  }

  render () {
    const { mailboxIds } = this.state

    if (mailboxIds.length) {
      return (
        <div className='ReactComponent-MailboxTabManager'>
          {mailboxIds.map((mailboxId) => {
            return (<MailboxTab key={mailboxId} mailboxId={mailboxId} />)
          })}
        </div>
      )
    } else {
      return (
        <div className='ReactComponent-MailboxTabManager'>
          <Welcome />
        </div>
      )
    }
  }
}
