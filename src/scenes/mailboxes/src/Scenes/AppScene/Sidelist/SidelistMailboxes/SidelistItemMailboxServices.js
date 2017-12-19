import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistItemMailboxService from './SidelistItemMailboxService'
import { mailboxStore, mailboxActions, MailboxReducer } from 'stores/mailbox'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'

const styles = {
  container: {
    transition: 'max-height 0.5s ease-in-out',
    maxHeight: 500, // just an arbitrarily big number for the animation
    overflow: 'hidden'
  },
  containerCollapsed: {
    maxHeight: 0
  }
}

const SortableItem = SortableElement(({ mailboxId, serviceType, onOpenService, onContextMenu }) => {
  return (
    <SidelistItemMailboxService
      key={serviceType}
      mailboxId={mailboxId}
      serviceType={serviceType}
      onOpenService={onOpenService}
      onContextMenu={(evt) => onContextMenu(evt, serviceType)} />
  )
})

const SortableList = SortableContainer(({ mailboxId, serviceTypes, onOpenService, onContextMenu }) => {
  return (
    <div>
      {serviceTypes.map((serviceType, index) => (
        <SortableItem
          key={serviceType}
          index={index}
          mailboxId={mailboxId}
          serviceType={serviceType}
          onOpenService={onOpenService}
          onContextMenu={onContextMenu} />
      ))}
    </div>
  )
})

export default class SidelistItemMailboxServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired,
    onContextMenuService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = this.generateState()

  generateState (props = this.props) {
    const { mailboxId } = props
    const mailboxState = mailboxStore.getState()
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      isActiveMailbox: mailboxState.activeMailboxId() === mailboxId
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId } = this.props
    this.setState({
      mailbox: mailboxState.getMailbox(mailboxId),
      isActiveMailbox: mailboxState.activeMailboxId() === mailboxId
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      onOpenService,
      onContextMenuService
    } = this.props
    const { mailbox, isActiveMailbox } = this.state
    if (!mailbox || !mailbox.hasAdditionalServices) { return false }

    const style = {
      ...styles.container,
      ...(mailbox.collapseSidebarServices && !isActiveMailbox ? styles.containerCollapsed : undefined)
    }

    return (
      <div style={style}>
        <SortableList
          axis='y'
          distance={20}
          serviceTypes={mailbox.additionalServiceTypes}
          mailboxId={mailbox.id}
          onOpenService={onOpenService}
          onContextMenu={onContextMenuService}
          onSortEnd={({ oldIndex, newIndex }) => {
            // +1 to the index because the default service isn't counted in this list
            mailboxActions.reduce(mailbox.id, MailboxReducer.changeServiceIndex, mailbox.additionalServiceTypes[oldIndex], newIndex + 1)
          }} />
      </div>
    )
  }
}
