import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import uuid from 'uuid'
import MailboxServicePopover from '../MailboxServicePopover'
import { ServiceBadge, ServiceTooltip } from 'Components/Service'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'

const styles = {
  /**
  * Layout
  */
  tab: {
    cursor: 'pointer',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    position: 'relative',
    WebkitAppRegion: 'no-drag'
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
  },

  /**
  * Badge
  */
  badge: {
    position: 'absolute',
    height: 14,
    minWidth: 14,
    fontSize: '11px',
    borderRadius: 3,
    lineHeight: '14px',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: Colors.red50,
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 2,
    paddingRight: 2
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 10
  },
  badgeContainer: {
    padding: 0,
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

export default class ToolbarMailboxService extends React.Component {
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

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
  }

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
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
    const settingsState = settingsStore.getState()
    const { mailboxId, serviceType } = this.props
    return Object.assign({
      isHovering: false,
      popover: false,
      popoverAnchor: null,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.sidebarTooltipsEnabled
    }, this.generateStateFromMailbox(mailboxStore.getState(), mailboxId, serviceType))
  })()

  mailboxChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    this.setState(this.generateStateFromMailbox(mailboxState, mailboxId, serviceType))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.sidebarTooltipsEnabled
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      isRestricted: mailboxState.isMailboxRestricted(this.props.mailboxId, userState.user)
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
    const userState = userStore.getState()
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isRestricted: mailboxState.isMailboxRestricted(mailboxId, userState.user)
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
    mailboxActions.changeActive(this.props.mailboxId, this.props.serviceType)
  }

  /**
  * Handles the popover opening
  * @param evt: the event that fired
  */
  handleOpenPopover = (evt) => {
    evt.preventDefault()
    this.setState({
      popover: true,
      popoverAnchor: evt.target
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
      serviceType,
      ...passProps
    } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      service,
      mailbox,
      popover,
      popoverAnchor,
      globalShowSleepableServiceIndicator,
      tooltipsEnabled,
      isRestricted
    } = this.state

    if (!mailbox || !service) { return false }

    const showSleeping = globalShowSleepableServiceIndicator && mailbox.showSleepableServiceIndicator && isSleeping

    return (
      <div
        {...passProps}
        style={{
          borderBottomColor: isActive || isHovering ? 'white' : 'transparent',
          backgroundColor: isActive ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          height: toolbarHeight,
          width: toolbarHeight,
          ...styles.tab
        }}
        id={`ReactComponent-Toolbar-Mailbox-Service-${this.instanceId}`}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={this.handleServiceClicked}
        onContextMenu={this.handleOpenPopover}>
        <ServiceBadge
          id={`ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`}
          isAuthInvalid={false}
          supportsUnreadCount={service.supportsUnreadCount}
          showUnreadBadge={service.showUnreadBadge}
          unreadCount={service.unreadCount}
          supportsUnreadActivity={service.supportsUnreadActivity}
          showUnreadActivityBadge={service.showUnreadActivityBadge}
          hasUnreadActivity={service.hasUnreadActivity}
          color={service.unreadBadgeColor}
          badgeStyle={styles.badge}
          style={styles.badgeContainer}
          iconStyle={styles.badgeFAIcon}
          onMouseEnter={() => this.setState({ isHovering: true })}
          onMouseLeave={() => this.setState({ isHovering: false })}>
          <div style={{
            backgroundImage: `url("${Resolver.image(service.humanizedLogoAtSize(96))}")`,
            filter: showSleeping ? 'grayscale(100%)' : 'none',
            ...styles.avatar
          }} />
        </ServiceBadge>
        {tooltipsEnabled ? (
          <ServiceTooltip
            mailbox={mailbox}
            service={service}
            isRestricted={isRestricted}
            active={isHovering}
            tooltipTimeout={0}
            position='bottom'
            arrow='center'
            group={this.instanceId}
            parent={`#ReactComponent-Toolbar-Mailbox-Service-${this.instanceId}`} />
        ) : undefined}
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
