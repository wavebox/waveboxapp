import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import uuid from 'uuid'
import MailboxServicePopover from '../MailboxServicePopover'
import MailboxServiceBagde from 'wbui/MailboxServiceBadge'
import MailboxServiceTooltip from 'wbui/MailboxServiceTooltip'
import Resolver from 'Runtime/Resolver'
import UISettings from 'shared/Models/Settings/UISettings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import red from '@material-ui/core/colors/red'

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
    color: red[50],
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
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
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
    return Object.assign({
      isHovering: false,
      popoverAnchor: null,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.TOOLBAR_ONLY
    }, this.generateStateFromMailbox(accountStore.getState(), mailboxId, serviceId))
  })()

  accountChanged = (accountState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.generateStateFromMailbox(accountState, mailboxId, serviceId))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.TOOLBAR_ONLY
    })
  }

  userChanged = (userState) => {
    const accountState = accountStore.getState()
    this.setState({
      isRestricted: accountState.isServiceRestricted(this.props.serviceId)
    })
  }

  /**
  * Generates the state from a mailbox
  * @param accountState: the current account state to use
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the type of the service
  */
  generateStateFromMailbox (accountState, mailboxId, serviceId) {
    return {
      mailbox: accountState.getMailbox(mailboxId),
      service: accountState.getService(serviceId),
      isSleeping: accountState.isServiceSleeping(serviceId),
      isActive: accountState.isServiceActive(serviceId),
      isRestricted: accountState.isServiceRestricted(serviceId)
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
      serviceId,
      classes,
      className,
      style,
      ...passProps
    } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      service,
      mailbox,
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
        className={classNames(
          classes.tab,
          isActive ? 'is-active' : undefined,
          className
        )}
        style={{ height: toolbarHeight, width: toolbarHeight, ...style }}
        id={`ReactComponent-Toolbar-Mailbox-Service-${this.instanceId}`}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={this.handleServiceClicked}
        onContextMenu={this.handleOpenPopover}>
        {/*<MailboxServiceBagde
          id={`ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`}
          isAuthInvalid={false}
          supportsUnreadCount={service.supportsUnreadCount}
          showUnreadBadge={service.showUnreadBadge}
          unreadCount={service.unreadCount}
          supportsUnreadActivity={service.supportsUnreadActivity}
          showUnreadActivityBadge={service.showUnreadActivityBadge}
          hasUnreadActivity={service.hasUnreadActivity}
          color={service.unreadBadgeColor}
          badgeClassName={classes.badge}
          className={classes.badgeContainer}
          iconClassName={classes.badgeFAIcon}
          onMouseEnter={() => this.setState({ isHovering: true })}
          onMouseLeave={() => this.setState({ isHovering: false })}>
          <div
            className={classNames(classes.avatar, `WB-ServiceIcon-${mailbox.id}_${service.id}`)}
            style={{
              backgroundImage: `url("${Resolver.image(service.humanizedLogoAtSize(96))}")`,
              filter: showSleeping ? 'grayscale(100%)' : 'none'
            }} />
          </MailboxServiceBagde>*/}
        {/*
        {tooltipsEnabled ? (
          <MailboxServiceTooltip
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
        */}
        <MailboxServicePopover
          mailboxId={mailboxId}
          serviceId={serviceId}
          isOpen={!!popoverAnchor}
          anchor={popoverAnchor}
          onRequestClose={() => this.setState({ popoverAnchor: null })} />
      </div>
    )
  }
}

export default ToolbarMailboxService
