import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import SidelistItemMailbox from './SidelistItemMailbox'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

const SortableItem = SortableElement(({ mailboxId }) => {
  return (<SidelistItemMailbox mailboxId={mailboxId} />)
})

const SortableList = SortableContainer(({ mailboxIds }) => {
  return (
    <div>
      {mailboxIds.map((mailboxId, index) => (
        <SortableItem key={mailboxId} index={index} mailboxId={mailboxId} />
      ))}
    </div>
  )
})

class SortableRestart extends React.Component {
  // This is a really terrible fix for https://github.com/clauderic/react-sortable-hoc/issues/305
  state = { restart: false }
  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxIds.length !== nextProps.mailboxIds.length) {
      this.setState({restart: true})
      window.requestAnimationFrame(() => { this.setState({restart: false}) })
    }
  }
  render () {
    if (this.state.restart) {
      return (
        <div>
          {this.props.mailboxIds.map((mailboxId, index) => (
            <SidelistItemMailbox mailboxId={mailboxId} key={mailboxId} />
          ))}
        </div>
      )
    } else {
      return (<SortableList {...this.props} />)
    }
  }
}

const styles = {
  root: {
    '&::-webkit-scrollbar': { display: 'none' }
  }
}

@withStyles(styles)
class SidelistMailboxes extends React.Component {
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
    return {
      mailboxIds: accountStore.getState().mailboxIds()
    }
  })()

  accountChanged = (accountState) => {
    this.setState({ mailboxIds: accountState.mailboxIds() })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }
    return false
  }

  render () {
    const { className, classes, ...passProps } = this.props
    const { mailboxIds } = this.state

    return (
      <div {...passProps} className={classNames(classes.root, 'WB-Sidelist-Mailboxes', className)}>
        <SortableRestart
          axis='y'
          distance={20}
          mailboxIds={mailboxIds}
          onSortEnd={({ oldIndex, newIndex }) => {
            accountActions.changeMailboxIndex(mailboxIds[oldIndex], newIndex)
          }} />
      </div>
    )
  }
}

export default SidelistMailboxes
