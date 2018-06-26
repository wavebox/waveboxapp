import React from 'react'
import { accountStore } from 'stores/account'
import Welcome from '../Welcome'
import MailboxTab from './MailboxTab'
import shallowCompare from 'react-addons-shallow-compare'

export default class MailboxTabManager extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    // When re-ordering mailboxes, the action of moving a webview around the dom
    // can cause a reload. Particularly when the new position is lower in the tree.
    // Sorting the mailbox ids prevents this behaviour and we don't actually use
    // the ordering for anything more than sanity. Fixes #548
    return {
      mailboxIds: accountState.mailboxIds().sort()
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      mailboxIds: accountState.mailboxIds().sort()
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
