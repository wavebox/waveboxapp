import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import ReactPortalTooltip from 'react-portal-tooltip'
import { basicPopoverStyles } from './ToolbarPopoverStyles'
import uuid from 'uuid'
import MailboxServicePopover from '../../MailboxServicePopover'

const styles = {
  tab: {
    cursor: 'pointer',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    position: 'relative'
  },
  avatar: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain'
  },
  tooltipContent: {
    whiteSpace: 'nowrap'
  }
}

export default class MailboxToolbarService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      const { mailboxId, serviceType } = nextProps
      this.setState(this.generateStateFromMailbox(mailboxStore.getState(), mailboxId, serviceType))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId, serviceType } = this.props
    return Object.assign({
      isHovering: false,
      popover: false,
      popoverAnchor: null,
      generatedId: uuid.v4(),
      globalShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator
    }, this.generateStateFromMailbox(mailboxStore.getState(), mailboxId, serviceType))
  })()

  mailboxChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    this.setState(this.generateStateFromMailbox(mailboxState, mailboxId, serviceType))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  /**
  * Generates the state from a mailbox
  * @param mailboxState: the current mailbox state to use
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of the service
  */
  generateStateFromMailbox (mailboxState, mailboxId, serviceType) {
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isActive: mailboxState.isActive(mailboxId, serviceType)
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the service being clicked
  */
  handleServiceClicked = (evt) => {
    evt.preventDefault()
    mailboxActions.changeActive(this.props.mailboxId, this.props.serviceType)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { toolbarHeight, mailboxId, serviceType, ...passProps } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      service,
      mailbox,
      generatedId,
      popover,
      popoverAnchor,
      globalShowSleepableServiceIndicator
    } = this.state

    if (!mailbox || !service) { return false }

    const showSleeping = globalShowSleepableServiceIndicator && service.showSleepableIndicator && isSleeping
    const elementId = `ReactComponent-Toolbar-Item-${generatedId}`
    return (
      <div
        {...passProps}
        style={{
          borderBottomColor: isActive || isHovering ? 'white' : 'transparent',
          backgroundColor: isActive ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          height: toolbarHeight,
          width: toolbarHeight,
          filter: showSleeping ? 'grayscale(100%)' : 'none',
          ...styles.tab
        }}
        id={elementId}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={this.handleServiceClicked}
        onContextMenu={(evt) => this.setState({ popover: true, popoverAnchor: evt.target })}>
        <div style={{
          backgroundImage: `url("../../${service.humanizedLogo}")`,
          ...styles.avatar
        }} />
        <ReactPortalTooltip
          active={isHovering}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='bottom'
          arrow='top'
          group={elementId}
          parent={`#${elementId}`}>
          <span style={styles.tooltipContent}>
            {service.humanizedType}
          </span>
        </ReactPortalTooltip>
        <MailboxServicePopover
          mailboxId={mailboxId}
          serviceType={serviceType}
          isOpen={popover}
          anchor={popoverAnchor}
          onRequestClose={() => this.setState({ popover: false })} />
      </div>
    )
  }
}
