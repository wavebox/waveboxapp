import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import uuid from 'uuid'
import UISettings from 'shared/Models/Settings/UISettings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyledMailboxServiceBadge from '../SidelistCommon/StyledMailboxServiceBadge'
import SidelistServiceTooltip from '../SidelistCommon/SidelistServiceTooltip'
import SidelistServiceAvatar from '../SidelistCommon/SidelistServiceAvatar'

const styles = {
  badge: {
    fontSize: '11px',
    height: 20,
    top: 0
  }
}

@withStyles(styles)
class SidelistMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
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
      this.setState(this.generateAccountState(nextProps.mailboxId, nextProps.serviceId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId, serviceId } = this.props
    const settingsState = settingsStore.getState()
    return {
      ...this.generateAccountState(mailboxId, serviceId, accountStore.getState()),
      isHovering: false,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  generateAccountState (mailboxId, serviceId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return {
      mailbox: mailbox,
      service: service,
      isAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      isServiceActive: accountState.isServiceActive(serviceId),
      avatar: accountState.getServiceAvatarConfig(serviceId),
      ...(service && serviceData ? {
        unreadCount: serviceData.getUnreadCount(service),
        hasUnreadActivity: serviceData.getHasUnreadActivity(service)
      } : {
        unreadCount: 0,
        hasUnreadActivity: false
      })
    }
  }

  accountChanged = (accountState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.generateAccountState(mailboxId, serviceId, accountState))
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    })
  }

  userChanged = (userState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.generateAccountState(mailboxId, serviceId, accountStore.getState()))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      serviceId,
      onOpenService,
      classes,
      ...passProps
    } = this.props
    const {
      isHovering,
      mailbox,
      service,
      unreadCount,
      hasUnreadActivity,
      isAuthInvalid,
      globalShowSleepableServiceIndicator,
      isServiceSleeping,
      isServiceActive,
      tooltipsEnabled,
      avatar
    } = this.state
    if (!service || !mailbox) { return false }

    const showSleeping =
      globalShowSleepableServiceIndicator &&
      mailbox.showSleepableServiceIndicator &&
      isServiceSleeping

    return (
      <StyledMailboxServiceBadge
        id={`ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`}
        supportsUnreadCount={service.supportsUnreadCount}
        showUnreadBadge={service.showBadgeCount}
        unreadCount={unreadCount}
        badgeClassName={classes.badge}
        supportsUnreadActivity={service.supportsUnreadActivity}
        showUnreadActivityBadge={service.showBadgeActivity}
        hasUnreadActivity={hasUnreadActivity}
        color={service.badgeColor}
        isAuthInvalid={isAuthInvalid}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={(evt) => onOpenService(evt, serviceId)}
        {...passProps}>
        <SidelistServiceAvatar
          className={classNames(
            classes.avatar,
            'WB-ServiceIcon',
            `WB-ServiceIcon-${mailboxId}_${serviceId}`
          )}
          avatar={avatar}
          size={35}
          isSleeping={showSleeping}
          showColorRing={mailbox.showAvatarColorRing}
          borderWidth={3}
          lightenBorder={!isServiceActive && !isHovering} />
        {tooltipsEnabled ? (
          <SidelistServiceTooltip
            serviceId={serviceId}
            active={isHovering}
            group={this.instanceId}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`} />
        ) : undefined}
      </StyledMailboxServiceBadge>
    )
  }
}

export default SidelistMailboxService
