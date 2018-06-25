import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ToolbarMailboxService from './ToolbarMailboxService'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  tabs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
}

const SortableItem = SortableElement(({ mailboxId, serviceId, toolbarHeight }) => {
  return (
    <ToolbarMailboxService
      key={serviceId}
      toolbarHeight={toolbarHeight}
      mailboxId={mailboxId}
      serviceId={serviceId} />
  )
})

const SortableList = SortableContainer(({ mailboxId, serviceIds, toolbarHeight, style, className }) => {
  return (
    <div style={style} className={className}>
      {serviceIds.map((serviceId, index) => (
        <SortableItem
          key={serviceId}
          index={index}
          mailboxId={mailboxId}
          serviceId={serviceId}
          toolbarHeight={toolbarHeight} />
      ))}
    </div>
  )
})

@withStyles(styles)
class ToolbarMailboxServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const mailbox = accountStore.getState().getMailbox(props.mailboxId)
    if (!mailbox) {
      return { }
    } else {
      return {
        serviceIds: mailbox.allServices
      }
    }
  }

  accountChanged = (accountState) => {
    const mailbox = accountState.getMailbox(this.props.mailboxId)
    if (!mailbox) {
      this.setState({
        serviceIds: undefined
      })
    } else {
      this.setState({
        serviceIds: mailbox.allServices
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (this.props.toolbarHeight !== nextProps.toolbarHeight) { return true }
    if (JSON.stringify(this.state.serviceIds) !== JSON.stringify(nextState.serviceIds)) { return true }

    return false
  }

  render () {
    const { mailboxId, toolbarHeight, style, classes, className } = this.props
    const { serviceIds } = this.state
    if (!serviceIds) { return false }

    return (
      <SortableList
        axis='x'
        distance={20}
        className={classNames(classes.tabs, className)}
        style={{ height: toolbarHeight, ...style }}
        serviceIds={serviceIds}
        mailboxId={mailboxId}
        toolbarHeight={toolbarHeight}
        onSortEnd={({ oldIndex, newIndex }) => {
          accountActions.reduceMailbox(mailboxId, MailboxReducer.changeServiceIndex, serviceIds[oldIndex], newIndex)
        }} />
    )
  }
}

export default ToolbarMailboxServices
