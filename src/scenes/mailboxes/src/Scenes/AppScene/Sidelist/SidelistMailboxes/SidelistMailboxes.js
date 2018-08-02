import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import SidelistItemMailbox from './SidelistItemMailbox'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import shallowCompare from 'react-addons-shallow-compare'

const SortableItem = SortableElement(({ mailboxId }) => {
  // Only return native dom component here, otherwise adding and removing
  // becomes super-buggy!
  return (
    <div>
      <SidelistItemMailbox mailboxId={mailboxId} />
    </div>
  )
})

const SortableList = SortableContainer(({ mailboxIds, disabled }) => {
  return (
    <div>
      {mailboxIds.map((mailboxId, index) => (
        <SortableItem
          key={mailboxId}
          index={index}
          mailboxId={mailboxId}
          disabled={disabled}
          collection='Singleton_SidelistMailboxes' />
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
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      mailboxIds: accountStore.getState().mailboxIds(),
      disabled: settingsStore.getState().ui.lockSidebarsAndToolbars
    }
  })()

  accountChanged = (accountState) => {
    this.setState({ mailboxIds: accountState.mailboxIds() })
  }

  settingsChanged = (settingsState) => {
    this.setState({ disabled: settingsState.ui.lockSidebarsAndToolbars })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, ...passProps } = this.props
    const { mailboxIds, disabled } = this.state

    return (
      <div {...passProps} className={classNames(classes.root, 'WB-Sidelist-Mailboxes', className)}>
        <SortableList
          axis='y'
          distance={5}
          mailboxIds={mailboxIds}
          disabled={disabled}
          onSortEnd={({ oldIndex, newIndex }) => {
            accountActions.changeMailboxIndex(mailboxIds[oldIndex], newIndex)
          }} />
      </div>
    )
  }
}

export default SidelistMailboxes
