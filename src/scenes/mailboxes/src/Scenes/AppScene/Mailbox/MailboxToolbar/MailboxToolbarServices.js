import PropTypes from 'prop-types'
import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import MailboxToolbarService from './MailboxToolbarService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

const styles = {
  tabs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
}

export default class MailboxToolbarServices extends React.Component {
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
    return {
      serviceTypes: mailbox.enabledServiceTypes,
      layoutMode: mailbox.serviceToolbarIconLayout
    }
  }

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    this.setState({
      serviceTypes: mailbox.enabledServiceTypes,
      layoutMode: mailbox.serviceToolbarIconLayout
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (this.props.toolbarHeight !== nextProps.toolbarHeight) { return true }
    if (this.state.layoutMode !== nextState.layoutMode) { return true }
    if (JSON.stringify(this.state.serviceTypes) !== JSON.stringify(nextState.serviceTypes)) { return true }

    return false
  }

  /**
  * Converts the layoutmode to the alignSelf style
  * @param layoutMode: the layout mode
  * @return prop that can be used for alignSelf
  */
  renderAlignSelfStyle (layoutMode) {
    switch (layoutMode) {
      case CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.LEFT_ALIGN: return 'flex-start'
      case CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN: return 'flex-end'
      default: return undefined
    }
  }

  render () {
    const { mailboxId, toolbarHeight, style, ...passProps } = this.props
    const { serviceTypes, layoutMode } = this.state
    const saltedStyle = Object.assign({
      height: toolbarHeight,
      alignSelf: this.renderAlignSelfStyle(layoutMode)
    },
    styles.tabs,
    style)

    return (
      <div {...passProps} style={saltedStyle}>
        {serviceTypes.map((serviceType) => {
          return (
            <MailboxToolbarService
              toolbarHeight={toolbarHeight}
              key={serviceType}
              mailboxId={mailboxId}
              serviceType={serviceType} />)
        })}
      </div>
    )
  }
}
