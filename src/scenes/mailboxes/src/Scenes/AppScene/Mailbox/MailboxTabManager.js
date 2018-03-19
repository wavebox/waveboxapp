import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import { userStore } from 'stores/user'
import Welcome from '../Welcome/Welcome'
import MailboxTab from './MailboxTab'
import shallowCompare from 'react-addons-shallow-compare'

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
    // When re-ordering mailboxes, the action of moving a webview around the dom
    // can cause a reload. Particularly when the new position is lower in the tree.
    // Sorting the mailbox ids prevents this behaviour and we don't actually use
    // the ordering for anything more than sanity. Fixes #548
    return {
      mailboxIds: mailboxState.unrestrictedMailboxIds().sort()
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState({
      mailboxIds: mailboxState.unrestrictedMailboxIds().sort()
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      mailboxIds: mailboxState.unrestrictedMailboxIds().sort()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }
    return shallowCompare({ state: {}, props: this.props }, nextProps, {})
  }

  render () {
    const { mailboxIds } = this.state

    if (mailboxIds.length) {
      return (
        <div {...this.props}>
          {mailboxIds.map((mailboxId) => {
            return (<MailboxTab key={mailboxId} mailboxId={mailboxId} />)
          })}
        </div>
      )
    } else {
      return (
        <div {...this.props}>
          <Welcome />
        </div>
      )
    }
  }
}
