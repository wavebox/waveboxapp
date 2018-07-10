import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceTab from './ServiceTab'
import { accountStore, accountActions } from 'stores/account'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ServiceTabTools from './ServiceTabTools'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'

const styles = {
  container: {
    '&.sidelist': {
      transition: 'max-height 0.5s ease-in-out',
      transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
      maxHeight: 500, // just an arbitrarily big number for the animation
      overflow: 'hidden',

      '&.collapsed': { maxHeight: 0 }
    },
    '&.toolbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    }
  }
}

const SortableItem = SortableElement((props) => {
  return (<ServiceTab {...props} />)
})

const SortableList = SortableContainer((props) => {
  const { serviceIds, ...passProps } = props
  return (
    <div>
      {serviceIds.map((serviceId, index) => (
        <SortableItem key={serviceId} index={index} serviceId={serviceId} {...passProps} />
      ))}
    </div>
  )
})

@withStyles(styles)
class ServiceTabs extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    uiLocation: PropTypes.oneOf(Object.keys(ACMailbox.SERVICE_UI_LOCATIONS)),
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
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.uiLocation !== nextProps.uiLocation) {
      this.setState(this.generateState(nextProps.mailboxId, nextProps.uiLocation, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId, uiLocation } = this.props
    return this.generateState(mailboxId, uiLocation, accountStore.getState())
  })()

  accountChanged = (accountStore) => {
    const { mailboxId, uiLocation } = this.props
    this.setState(this.generateState(mailboxId, uiLocation, accountStore))
  }

  /**
  * Generates the state from stores and props
  * @param mailboxId: the id of the mailbox to use
  * @param uiLocation: the ui location to render for
  * @param accountState: the current account state
  * @return a state changeset
  */
  generateState (mailboxId, uiLocation, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)

    return {
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      ...(mailbox ? {
        collapseOnInactive: mailbox.collapseSidebarServices,
        serviceIds: ServiceTabTools.uiLocationServiceIds(uiLocation, mailbox)
      } : {
        collapseOnInactive: false,
        serviceIds: []
      })
    }
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
      uiLocation,
      classes,
      ...passProps
    } = this.props
    const {
      isMailboxActive,
      collapseOnInactive,
      serviceIds
    } = this.state
    if (!serviceIds.length) { return false }

    return (
      <div
        {...passProps}
        className={classNames(
          classes.container,
          ServiceTabTools.uiLocationClassName(uiLocation),
          collapseOnInactive && !isMailboxActive ? 'collapsed' : undefined,
          'WB-ServiceTabs',
          className
        )}>
        <SortableList
          axis={ServiceTabTools.uiLocationAxis(uiLocation)}
          distance={20}
          serviceIds={serviceIds}
          mailboxId={mailboxId}
          uiLocation={uiLocation}
          onOpenService={onOpenService}
          onOpenServiceMenu={onContextMenuService}
          onSortEnd={({ prevIndex, nextIndex }) => {
            // Optimistically update the services in the current state. The round trip across
            // the ipc bridge takes a few ms and can cause jank
            this.setState({
              serviceIds: serviceIds.splice(nextIndex, 0, serviceIds.splice(prevIndex, 1)[0])
            })

            // Actually change the data
            accountActions.reduceMailbox(
              mailboxId,
              MailboxReducer.changeServiceIndex,
              serviceIds[prevIndex],
              nextIndex
            )
          }} />
      </div>
    )
  }
}

export default ServiceTabs
