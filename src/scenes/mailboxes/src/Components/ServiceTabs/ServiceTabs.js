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
  },
  sortableListContainer: {
    '&.toolbar': {
      display: 'flex'
    }
  }
}

const SortableItem = SortableElement((props) => {
  return (<ServiceTab {...props} />)
})

const SortableList = SortableContainer((props) => {
  const { containerClassName, serviceIds, ...passProps } = props
  return (
    <div className={containerClassName}>
      {serviceIds.map((serviceId, index) => (
        <SortableItem key={serviceId} index={index} serviceId={serviceId} {...passProps} />
      ))}
    </div>
  )
})

class SortableRestart extends React.Component {
  // This is a really terrible fix for https://github.com/clauderic/react-sortable-hoc/issues/305
  state = { restart: false }
  componentWillReceiveProps (nextProps) {
    if (this.props.serviceIds.length !== nextProps.serviceIds.length) {
      this.setState({restart: true})
      window.requestAnimationFrame(() => { this.setState({restart: false}) })
    }
  }
  render () {
    if (this.state.restart) {
      const {
        axis,
        containerClassName,
        distance,
        onSortEnd,
        serviceIds,
        ...passProps
      } = this.props
      return (
        <div>
          {serviceIds.map((serviceId, index) => (
            <ServiceTab serviceId={serviceId} key={serviceId} {...passProps} />
          ))}
        </div>
      )
    } else {
      return (<SortableList {...this.props} />)
    }
  }
}

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
    const classNameAppend = ServiceTabTools.uiLocationClassName(uiLocation)

    return (
      <div
        {...passProps}
        className={classNames(
          classes.container,
          classNameAppend,
          collapseOnInactive && !isMailboxActive ? 'collapsed' : undefined,
          'WB-ServiceTabs',
          className
        )}>
        <SortableRestart
          axis={ServiceTabTools.uiLocationAxis(uiLocation)}
          containerClassName={classNames(classes.sortableListContainer, classNameAppend)}
          distance={20}
          serviceIds={serviceIds}
          mailboxId={mailboxId}
          uiLocation={uiLocation}
          onOpenService={onOpenService}
          onOpenServiceMenu={onContextMenuService}
          onSortEnd={({ oldIndex, newIndex }) => {
            // Optimistically update the services in the current state. The round trip across
            // the ipc bridge takes a few ms and can cause jank
            const serviceIdsCpy = Array.from(serviceIds)
            serviceIdsCpy.splice(newIndex, 0, serviceIdsCpy.splice(oldIndex, 1)[0])
            this.setState({ serviceIds: serviceIdsCpy })

            // Actually change the data
            accountActions.reduceMailbox(
              mailboxId,
              MailboxReducer.changeServiceIndex,
              serviceIds[oldIndex],
              newIndex
            )
          }} />
      </div>
    )
  }
}

export default ServiceTabs
