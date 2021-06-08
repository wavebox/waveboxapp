import React from 'react'
import { accountStore } from 'stores/account'
import Welcome from '../Welcome'
import ServiceTab from '../ServiceTab'
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
      serviceIds: accountState.serviceIds().sort()
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      serviceIds: accountState.serviceIds().sort()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceIds } = this.state

    if (serviceIds.length) {
      return (
        <div {...this.props}>
          {serviceIds.map((serviceId) => {
            return (<ServiceTab key={serviceId} serviceId={serviceId} />)
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
