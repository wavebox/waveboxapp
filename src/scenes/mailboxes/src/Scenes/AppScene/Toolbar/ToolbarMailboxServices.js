import PropTypes from 'prop-types'
import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import ToolbarMailboxService from './ToolbarMailboxService'

const styles = {
  tabs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
}

export default class ToolbarMailboxServices extends React.Component {
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
    const { mailboxId, toolbarHeight, style, ...passProps } = this.props
    const { serviceTypes } = this.state
    if (!serviceTypes) { return false }

    return (
      <div
        {...passProps}
        style={{ height: toolbarHeight, ...styles.tabs, ...style }}>
        {serviceTypes.map((serviceType) => {
          return (
            <ToolbarMailboxService
              toolbarHeight={toolbarHeight}
              key={serviceType}
              mailboxId={mailboxId}
              serviceType={serviceType} />)
        })}
      </div>
    )
  }
}
