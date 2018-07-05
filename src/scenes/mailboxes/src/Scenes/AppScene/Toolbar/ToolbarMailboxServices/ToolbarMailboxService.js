import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import uuid from 'uuid'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import StyledMailboxServiceBadge from './StyledMailboxServiceBadge'
import ToolbarServiceTooltip from './ToolbarServiceTooltip'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ErrorBoundary from 'wbui/ErrorBoundary'

const styles = {
  /**
  * Layout
  */
  tab: {
    cursor: 'pointer',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    position: 'relative',
    WebkitAppRegion: 'no-drag',
    '&.is-active': {
      borderBottomColor: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    '&:hover': {
      borderBottomColor: 'white'
    }
  },

  /**
  * Avatar
  */
  avatar: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '24px 24px'
  }
}

@withStyles(styles)
class ToolbarMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
  }

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      const { mailboxId, serviceId } = nextProps
      this.setState(this.generateStateFromMailbox(accountStore.getState(), mailboxId, serviceId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const { mailboxId, serviceId } = this.props
    return {
      isHovering: false,
      popoverAnchor: null,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      ...this.generateStateFromMailbox(accountStore.getState(), mailboxId, serviceId)
    }
  })()

  accountChanged = (accountState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.generateStateFromMailbox(accountState, mailboxId, serviceId))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  /**
  * Generates the state from a mailbox
  * @param accountState: the current account state to use
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the type of the service
  */
  generateStateFromMailbox (accountState, mailboxId, serviceId) {
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return {
      mailbox: mailbox,
      service: service,
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      isServiceActive: accountState.isServiceActive(serviceId),
      isAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      ...(service && serviceData ? {
        unreadCount: serviceData.getUnreadCount(service),
        hasUnreadActivity: serviceData.getHasUnreadActivity(service)
      } : {
        unreadCount: 0,
        hasUnreadActivity: false
      })
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the service being clicked
  * @param evt: the event that fired
  */
  handleServiceClicked = (evt) => {
    evt.preventDefault()
    accountActions.changeActiveService(this.props.serviceId)
  }

  /**
  * Handles the popover opening
  * @param evt: the event that fired
  */
  handleOpenPopover = (evt) => {
    evt.preventDefault()
    this.setState({
      popoverAnchor: evt.target,
      isHovering: false
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
      toolbarHeight,
      mailboxId,
      serviceId,
      classes,
      className,
      style,
      ...passProps
    } = this.props
    const {
      isHovering,
      isServiceActive,
      isServiceSleeping,
      service,
      mailbox,
      popoverAnchor,
      globalShowSleepableServiceIndicator,
      unreadCount,
      hasUnreadActivity,
      isAuthInvalid
    } = this.state

    if (!mailbox || !service) { return false }

    const showSleeping =
      globalShowSleepableServiceIndicator &&
      mailbox.showSleepableServiceIndicator &&
      isServiceSleeping

    return (
      <div
        {...passProps}
        className={classNames(classes.tab, isServiceActive ? 'is-active' : undefined, className)}
        style={{ height: toolbarHeight, width: toolbarHeight, ...style }}
        id={`ReactComponent-Toolbar-Mailbox-Service-${this.instanceId}`}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={this.handleServiceClicked}
        onContextMenu={this.handleOpenPopover}>
        <StyledMailboxServiceBadge
          supportsUnreadCount={service.supportsUnreadCount}
          showUnreadBadge={service.showBadgeCount}
          unreadCount={unreadCount}
          supportsUnreadActivity={service.supportsUnreadActivity}
          showUnreadActivityBadge={service.showBadgeActivity}
          hasUnreadActivity={hasUnreadActivity}
          color={service.badgeColor}
          isAuthInvalid={isAuthInvalid}>
          <div
            className={classNames(classes.avatar, `WB-ServiceIcon-${mailbox.id}_${service.id}`)}
            style={{
              backgroundImage: `url("${Resolver.image(service.humanizedLogoAtSize(96))}")`,
              filter: showSleeping ? 'grayscale(100%)' : 'none'
            }} />
        </StyledMailboxServiceBadge>
        <ErrorBoundary>
          <ToolbarServiceTooltip
            serviceId={serviceId}
            active={isHovering}
            group={this.instanceId}
            parent={`#ReactComponent-Toolbar-Mailbox-Service-${this.instanceId}`} />
        </ErrorBoundary>
        <ErrorBoundary>
          <MailboxAndServiceContextMenu
            mailboxId={mailboxId}
            serviceId={serviceId}
            isOpen={!!popoverAnchor}
            anchor={popoverAnchor}
            onRequestClose={() => this.setState({ popoverAnchor: null })} />
        </ErrorBoundary>
      </div>
    )
  }
}

export default ToolbarMailboxService
