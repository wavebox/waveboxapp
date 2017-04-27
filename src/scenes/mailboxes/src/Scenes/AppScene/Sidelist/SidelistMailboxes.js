import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import SidelistItemMailbox from './SidelistItemMailbox'

export default class SidelistMailboxes extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      mailboxIds: mailboxStore.getState().mailboxIds()
    }
  })()

  mailboxesChanged = (store) => {
    this.setState({ mailboxIds: store.mailboxIds() })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }
    return false
  }

  render () {
    const { styles, ...passProps } = this.props
    const { mailboxIds } = this.state
    return (
      <div style={Object.assign({}, styles)} {...passProps}>
        {mailboxIds.map((mailboxId, index, arr) => {
          return (
            <SidelistItemMailbox
              key={mailboxId}
              mailboxId={mailboxId}
              index={index}
              isFirst={index === 0}
              isLast={index === arr.length - 1} />)
        })}
      </div>
    )
  }
}
