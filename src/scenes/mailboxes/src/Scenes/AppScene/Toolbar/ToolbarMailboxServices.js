import PropTypes from 'prop-types'
import React from 'react'
import { mailboxStore, mailboxActions, MailboxReducer } from 'stores/mailbox'
import ToolbarMailboxService from './ToolbarMailboxService'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import CoreService from 'shared/Models/Accounts/CoreService'
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

const SortableItem = SortableElement(({ mailboxId, serviceType, toolbarHeight }) => {
  return (
    <ToolbarMailboxService
      key={serviceType}
      toolbarHeight={toolbarHeight}
      mailboxId={mailboxId}
      serviceType={serviceType} />
  )
})

const SortableList = SortableContainer(({ mailboxId, serviceTypes, toolbarHeight, style, className }) => {
  return (
    <div style={style} className={className}>
      {serviceTypes.map((serviceType, index) => (
        <SortableItem
          key={serviceType}
          disabled={serviceType === CoreService.SERVICE_TYPES.DEFAULT}
          index={index}
          mailboxId={mailboxId}
          serviceType={serviceType}
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
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
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
    const mailbox = mailboxStore.getState().getMailbox(props.mailboxId)
    if (!mailbox) {
      return { }
    } else {
      return {
        serviceTypes: mailbox.enabledServiceTypes
      }
    }
  }

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    if (!mailbox) {
      this.setState({
        serviceTypes: undefined
      })
    } else {
      this.setState({
        serviceTypes: mailbox.enabledServiceTypes
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (this.props.toolbarHeight !== nextProps.toolbarHeight) { return true }
    if (JSON.stringify(this.state.serviceTypes) !== JSON.stringify(nextState.serviceTypes)) { return true }

    return false
  }

  render () {
    const { mailboxId, toolbarHeight, style, classes, className } = this.props
    const { serviceTypes } = this.state
    if (!serviceTypes) { return false }

    return (
      <SortableList
        axis='x'
        distance={20}
        className={classNames(classes.tabs, className)}
        style={{ height: toolbarHeight, ...style }}
        serviceTypes={serviceTypes}
        mailboxId={mailboxId}
        toolbarHeight={toolbarHeight}
        onSortEnd={({ oldIndex, newIndex }) => {
          mailboxActions.reduce(mailboxId, MailboxReducer.changeServiceIndex, serviceTypes[oldIndex], newIndex)
        }} />
    )
  }
}

export default ToolbarMailboxServices
