import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'
import Resolver from 'Runtime/Resolver'
import red from '@material-ui/core/colors/red'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'

const styles = (theme) => ({
  // Badge & Avatar
  badgeRoot: {
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    padding: 0,
    marginRight: -4
  },
  badge: {
    position: 'absolute',
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: red[50],
    fontSize: '11px',
    height: 14,
    minWidth: 14,
    lineHeight: '14px',
    borderRadius: 3,
    top: 0,
    right: -3,
    paddingLeft: 2,
    paddingRight: 2
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 10
  },
  avatar: {
    display: 'block',
    transform: 'translate3d(0, 0, 0)',
    cursor: 'pointer'
  }
})

@withStyles(styles, { withTheme: true })
class MailboxTooltipServiceItem extends React.Component {
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
      this.setState(
        this.deriveAccountState(mailboxId, serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId, serviceId } = this.props
    return {
      ...this.deriveAccountState(mailboxId, serviceId, accountStore.getState()),
      ...this.deriveSettingsState(settingsStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.deriveAccountState(mailboxId, serviceId, accountState))
  }

  settingsChanged = (settingsState) => {
    this.setState(this.deriveSettingsState(settingsState))
  }

  userChanged = (userState) => {
    const { mailboxId, serviceId } = this.props
    this.setState(this.deriveAccountState(mailboxId, serviceId, accountStore.getState()))
  }

  /**
  * Generates the account state
  * @param mailboxId: the id of the mailbox to use
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return the changeset
  */
  deriveAccountState (mailboxId, serviceId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return mailbox && service && serviceData ? {
      membersAvailable: true,
      supportsUnreadCount: service.supportsUnreadCount,
      showBadgeCount: service.showBadgeCount,
      supportsUnreadActivity: service.supportsUnreadActivity,
      showBadgeActivity: service.showBadgeActivity,
      badgeColor: service.badgeColor,
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
      mailboxShowSleepableServiceIndicator: mailbox.showSleepableServiceIndicator,
      isAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      avatar: accountState.getServiceAvatarConfig(serviceId),
      unreadCount: serviceData.getUnreadCount(service),
      hasUnreadActivity: serviceData.getHasUnreadActivity(service),
      isServiceRestricted: accountState.isServiceRestricted(serviceId)
    } : {
      membersAvailable: false
    }
  }

  /**
  * Generates the settings state
  * @param settingsState: the current settings state
  * @return the changeset
  */
  deriveSettingsState (settingsState) {
    return {
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, onOpenService, onClick } = this.props
    onOpenService(evt, serviceId)
    if (onClick) { onClick(evt) }
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
      onClick,
      classes,
      theme,
      ...passProps
    } = this.props
    const {
      membersAvailable,
      supportsUnreadCount,
      showBadgeCount,
      supportsUnreadActivity,
      showBadgeActivity,
      badgeColor,
      displayName,
      mailboxShowSleepableServiceIndicator,
      unreadCount,
      hasUnreadActivity,
      isAuthInvalid,
      globalShowSleepableServiceIndicator,
      isServiceSleeping,
      isServiceRestricted,
      avatar
    } = this.state
    if (!membersAvailable) { return false }

    return (
      <TooltipSectionListItem button onClick={this.handleClick} {...passProps}>
        <MailboxServiceBadge
          className={classes.badgeRoot}
          badgeClassName={classes.badge}
          iconClassName={classes.badgeFAIcon}
          supportsUnreadCount={supportsUnreadCount}
          showUnreadBadge={showBadgeCount}
          unreadCount={unreadCount}
          supportsUnreadActivity={supportsUnreadActivity}
          showUnreadActivityBadge={showBadgeActivity}
          hasUnreadActivity={hasUnreadActivity}
          color={badgeColor}
          isAuthInvalid={isAuthInvalid}>
          <ACAvatarCircle2
            avatar={avatar}
            circleProps={{ width: 1 }}
            size={24}
            preferredImageSize={96}
            resolver={(i) => Resolver.image(i)}
            showSleeping={globalShowSleepableServiceIndicator && mailboxShowSleepableServiceIndicator && isServiceSleeping}
            showRestricted={isServiceRestricted}
            className={classes.avatar} />
        </MailboxServiceBadge>
        <TooltipSectionListItemText inset primary={displayName} />
      </TooltipSectionListItem>
    )
  }
}

export default MailboxTooltipServiceItem
