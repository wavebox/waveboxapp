import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import CommandPaletteSearchItem from './CommandPaletteSearchItem'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'
import Resolver from 'Runtime/Resolver'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'

const styles = {
  badge: {
    position: 'absolute',
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    height: 18,
    minWidth: 18,
    width: 'auto',
    lineHeight: '18px',
    fontSize: '10px',
    top: -3,
    right: -7,
    boxShadow: ' 0px 0px 1px 0px rgba(0,0,0,0.8)'
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: '10px'
  },
  badgeContainer: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36
  },
  mailboxAvatar: {
    position: 'absolute',
    right: -6,
    bottom: -1
  }
}

@withStyles(styles)
class CommandPaletteSearchItemService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId || this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.generateServiceState(nextProps.serviceId, nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateServiceState(this.props.serviceId, this.props.mailboxId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(
      this.generateServiceState(this.props.serviceId, this.props.mailboxId, accountState)
    )
  }

  generateServiceState (serviceId, mailboxId, accountState) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    if (mailbox && service && serviceData) {
      const authData = accountState.getMailboxAuthForServiceId(serviceId)
      const isServiceSleeping = accountState.isServiceSleeping(serviceId)
      return {
        membersAvailable: true,
        displayName: accountState.resolvedServiceDisplayName(serviceId),
        mailboxAvatar: accountState.getMailboxAvatarConfig(mailbox.id),
        serviceAvatar: accountState.getServiceAvatarConfig(serviceId),
        isServiceSleeping: isServiceSleeping,
        supportsUnreadCount: service.supportsUnreadCount,
        showBadgeCount: service.showBadgeCount,
        unreadCount: serviceData.getUnreadCount(service),
        hasUnreadActivity: serviceData.getHasUnreadActivity(service),
        supportsUnreadActivity: service.supportsUnreadActivity,
        showBadgeActivity: service.showBadgeActivity,
        badgeColor: service.badgeColor,
        mailboxHasSingleService: mailbox.hasSingleService,
        documentTitle: serviceData.documentTitle,
        nextUrl: isServiceSleeping
          ? service.getUrlWithData(serviceData, authData)
          : service.url,
        mailboxHelperDisplayName: accountState.resolvedMailboxExplicitServiceDisplayName(mailboxId)
      }
    } else {
      return {
        membersAvailable: false
      }
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
    const { serviceId, onRequestClose, onClick } = this.props
    accountActions.changeActiveService(serviceId)
    onRequestClose()
    if (onClick) {
      onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      mailboxId,
      serviceId,
      onRequestClose,
      onClick,
      ...passProps
    } = this.props
    const {
      membersAvailable,
      displayName,
      mailboxAvatar,
      serviceAvatar,
      isServiceSleeping,
      supportsUnreadCount,
      showBadgeCount,
      unreadCount,
      hasUnreadActivity,
      supportsUnreadActivity,
      showBadgeActivity,
      badgeColor,
      mailboxHasSingleService,
      documentTitle,
      nextUrl,
      mailboxHelperDisplayName
    } = this.state
    if (!membersAvailable) { return false }

    return (
      <CommandPaletteSearchItem
        primaryText={(
          <React.Fragment>
            {displayName}
            {displayName !== mailboxHelperDisplayName ? (
              <Typography
                inline
                color='textSecondary'
                component='span'>
                &nbsp;{mailboxHelperDisplayName}
              </Typography>
            ) : undefined}
          </React.Fragment>
        )}
        secondaryText={documentTitle && documentTitle !== displayName ? documentTitle : nextUrl}
        onClick={this.handleClick}
        avatar={(
          <MailboxServiceBadge
            badgeClassName={classes.badge}
            className={classes.badgeContainer}
            iconClassName={classes.badgeFAIcon}
            supportsUnreadCount={supportsUnreadCount}
            showUnreadBadge={showBadgeCount}
            unreadCount={unreadCount}
            supportsUnreadActivity={supportsUnreadActivity}
            showUnreadActivityBadge={showBadgeActivity}
            hasUnreadActivity={hasUnreadActivity}
            color={badgeColor}
            isAuthInvalid={false}>
            <ACAvatarCircle2
              avatar={serviceAvatar}
              size={36}
              resolver={(i) => Resolver.image(i)}
              showSleeping={isServiceSleeping}
              circleProps={{ showSleeping: false }} />
            {!mailboxHasSingleService ? (
              <ACAvatarCircle2
                avatar={mailboxAvatar}
                className={classes.mailboxAvatar}
                size={16}
                resolver={(i) => Resolver.image(i)}
                showSleeping={false} />
            ) : undefined}
          </MailboxServiceBadge>
        )}
        {...passProps} />
    )
  }
}

export default CommandPaletteSearchItemService
