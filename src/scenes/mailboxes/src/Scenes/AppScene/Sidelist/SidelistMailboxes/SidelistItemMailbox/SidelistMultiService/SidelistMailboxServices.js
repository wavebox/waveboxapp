import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistMailboxService from './SidelistMailboxService'
import { accountStore, accountActions } from 'stores/account'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'

const styles = {
  container: {
    transition: 'max-height 0.5s ease-in-out',
    transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
    maxHeight: 500, // just an arbitrarily big number for the animation
    overflow: 'hidden'
  },
  containerCollapsed: {
    maxHeight: 0
  }
}

const SortableItem = SortableElement(({ mailboxId, serviceId, onOpenService, onContextMenu }) => {
  return (
    <SidelistMailboxService
      mailboxId={mailboxId}
      serviceId={serviceId}
      onOpenService={onOpenService}
      onContextMenu={(evt) => onContextMenu(evt, serviceId)} />
  )
})

const SortableList = SortableContainer(({ mailboxId, services, onOpenService, onContextMenu }) => {
  return (
    <div>
      {services.map((serviceId, index) => (
        <SortableItem
          key={serviceId}
          index={index}
          mailboxId={mailboxId}
          serviceId={serviceId}
          onOpenService={onOpenService}
          onContextMenu={onContextMenu} />
      ))}
    </div>
  )
})

@withStyles(styles)
class SidelistMailboxServices extends React.Component {
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
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps.mailboxId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props.mailboxId, accountStore.getState())

  generateState (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      ...(mailbox ? {
        collapse: mailbox.collapseSidebarServices,
        services: mailbox.sidebarServices
      } : {
        collapse: false,
        services: []
      })
    }
  }

  accountChanged = (accountStore) => {
    this.setState(this.generateState(this.props.mailboxId, accountStore))
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
      onContextMenuService,
      className,
      mailboxId,
      classes,
      ...passProps
    } = this.props
    const {
      isMailboxActive,
      collapse,
      services
    } = this.state
    if (!services.length) { return false }

    return (
      <div
        {...passProps}
        className={classNames(
          classes.container,
          collapse && !isMailboxActive ? classes.containerCollapsed : undefined,
          'WB-SidelistItemMailboxServices',
          className
        )}>
        <SortableList
          axis='y'
          distance={20}
          services={services}
          mailboxId={mailboxId}
          onOpenService={onOpenService}
          onContextMenu={onContextMenuService}
          onSortEnd={({ oldIndex, newIndex }) => {
            accountActions.reduceMailbox(mailboxId, MailboxReducer.changeServiceIndex, services[oldIndex], newIndex)
          }} />
      </div>
    )
  }
}

export default SidelistMailboxServices
