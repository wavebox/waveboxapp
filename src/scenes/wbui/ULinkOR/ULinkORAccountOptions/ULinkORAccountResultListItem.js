import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Typography, ListItem, ListItemText } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ACAvatarCircle2 from '../../ACAvatarCircle2'
import MailboxServiceBadge from '../../MailboxServiceBadge'
import classNames from 'classnames'

const privAccountStore = Symbol('privAccountStore')

const styles = {
  root: {
    paddingTop: 4,
    paddingBottom: 4,
    height: 65,
    '&:hover:not(:focus)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  avatarContainer: {
    position: 'relative',
    width: 36,
    minWidth: 36,
    height: 36,
    minHeight: 36,
    marginRight: 4
  },
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
class ULinkORAccountResultListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this[privAccountStore] = this.props.accountStore

    // Generate state
    this.state = {
      ...this.generateServiceState(this.props.serviceId, this[privAccountStore].getState())
    }
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this[privAccountStore].listen(this.accountUpdated)
  }

  componentWillUnmount () {
    this[privAccountStore].unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.accountStore !== nextProps.accountStore) {
      console.warn('Changing props.accountStore is not supported in ULinkORAccountResultListItem and will be ignored')
    }

    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.generateServiceState(nextProps.serviceId, this[privAccountStore].getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  accountUpdated = (accountState) => {
    this.setState(
      this.generateServiceState(this.props.serviceId, accountState)
    )
  }

  generateServiceState (serviceId, accountState) {
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
        mailboxHelperDisplayName: accountState.resolvedMailboxExplicitServiceDisplayName(mailbox.id)
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
    const { serviceId, onClick } = this.props
    if (onClick) {
      onClick(evt, serviceId)
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
      serviceId,
      avatarResolver,
      accountStore,
      onClick,
      className,
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
      <ListItem
        button
        className={classNames(className, classes.root)}
        onClick={this.handleClick}
        {...passProps}>
        <div className={classes.avatarContainer}>
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
              resolver={avatarResolver}
              showSleeping={isServiceSleeping}
              circleProps={{ showSleeping: false }} />
            {!mailboxHasSingleService ? (
              <ACAvatarCircle2
                avatar={mailboxAvatar}
                className={classes.mailboxAvatar}
                size={16}
                resolver={avatarResolver}
                showSleeping={false} />
            ) : undefined}
          </MailboxServiceBadge>
        </div>
        <ListItemText
          primary={(
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
          primaryTypographyProps={{ noWrap: true }}
          secondary={documentTitle && documentTitle !== displayName ? documentTitle : nextUrl}
          secondaryTypographyProps={{ noWrap: true }} />
      </ListItem>
    )
  }
}

export default ULinkORAccountResultListItem
