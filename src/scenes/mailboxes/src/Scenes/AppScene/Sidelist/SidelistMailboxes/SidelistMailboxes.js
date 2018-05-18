import React from 'react'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import SidelistItemMailbox from './SidelistItemMailbox'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import classNames from 'classnames'
import { withStyles } from 'material-ui/styles'

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
    const { className, classes, ...passProps } = this.props
    const { mailboxIds } = this.state

    return (
      <div {...passProps} className={classNames(classes.root, 'WB-Sidelist-Mailboxes', className)}>
        <SortableList
          axis='y'
          distance={20}
          mailboxIds={mailboxIds}
          onSortEnd={({ oldIndex, newIndex }) => {
            mailboxActions.changeIndex(mailboxIds[oldIndex], newIndex)
          }} />
      </div>
    )
  }
}

export default SidelistMailboxes
