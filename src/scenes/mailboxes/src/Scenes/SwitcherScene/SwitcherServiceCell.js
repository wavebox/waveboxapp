import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'
import ReactDOM from 'react-dom'

const SIZE = 126
const SERVICE_SIZE = 96
const MAILBOX_SIZE = 32
const styles = {
  root: {
    display: 'inline-block',
    width: SIZE
  },

  // Badge
  badge: {
    position: 'absolute',
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    height: 35,
    minWidth: 35,
    width: 'auto',
    lineHeight: '35px',
    fontSize: '18px',
    top: ((SIZE - SERVICE_SIZE) / 2),
    right: ((SIZE - SERVICE_SIZE) / 2),
    boxShadow: ' 0px 0px 3px 0px rgba(0,0,0,0.8)'
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: '18px'
  },
  badgeContainer: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: SIZE,
    height: SIZE
  },
  badgeContainerSelected: {
    backgroundColor: 'rgba(40, 40, 40, 0.2)',
    borderRadius: 10
  },

  // Avatars
  serviceAvatar: {

  },
  mailboxAvatar: {
    position: 'absolute',
    top: SIZE - ((SIZE - SERVICE_SIZE) / 2) - MAILBOX_SIZE,
    left: SIZE - ((SIZE - SERVICE_SIZE) / 2) - MAILBOX_SIZE
  },

  // Typography
  displayName: {
    height: 24,
    paddingLeft: 5,
    paddingRight: 5,
    color: 'rgb(130, 130, 130)',
    fontSize: '14px',
    textAlign: 'center',
    lineHeight: '24px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  documentTitle: {
    height: 20,
    paddingLeft: 5,
    paddingRight: 5,
    color: 'rgb(150, 150, 150)',
    fontSize: '11px',
    textAlign: 'center',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

@withStyles(styles)
class SwitcherServiceCell extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.deriveAccountState(nextProps.serviceId, accountStore.getState())
      )
    }
    if (this.props.isSelected !== nextProps.isSelected && nextProps.isSelected) {
      const root = ReactDOM.findDOMNode(this.rootRef.current)
      if (root) {
        root.scrollIntoView({ inline: 'end', behavior: 'smooth' })
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveAccountState(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.deriveAccountState(this.props.serviceId, accountState))
  }

  /**
  * Generates the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return the changeset
  */
  deriveAccountState (serviceId, accountState) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return mailbox && service && serviceData ? {
      membersAvailable: true,
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
      mailboxAvatar: accountState.getMailboxAvatarConfig(mailbox.id),
      serviceAvatar: accountState.getServiceAvatarConfig(serviceId),
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      supportsUnreadCount: service.supportsUnreadCount,
      showBadgeCount: service.showBadgeCount,
      unreadCount: serviceData.getUnreadCount(service),
      hasUnreadActivity: serviceData.getHasUnreadActivity(service),
      supportsUnreadActivity: service.supportsUnreadActivity,
      showBadgeActivity: service.showBadgeActivity,
      badgeColor: service.badgeColor,
      mailboxHasSingleService: mailbox.hasSingleService,
      documentTitle: serviceData.documentTitle
    } : {
      membersAvailable: false
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
      serviceId,
      classes,
      className,
      isSelected,
      ...passProps
    } = this.props
    const {
      membersAvailable,
      displayName,
      isServiceSleeping,
      mailboxAvatar,
      serviceAvatar,
      supportsUnreadCount,
      showBadgeCount,
      unreadCount,
      hasUnreadActivity,
      supportsUnreadActivity,
      showBadgeActivity,
      badgeColor,
      mailboxHasSingleService,
      documentTitle
    } = this.state
    if (!membersAvailable) { return false }

    return (
      <div
        ref={this.rootRef}
        className={classNames(className, classes.root)}
        {...passProps}>
        <MailboxServiceBadge
          badgeClassName={classes.badge}
          className={classNames(classes.badgeContainer, isSelected ? classes.badgeContainerSelected : undefined)}
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
            className={classes.serviceAvatar}
            size={SERVICE_SIZE}
            resolver={(i) => Resolver.image(i)}
            showSleeping={isServiceSleeping}
            circleProps={{ showSleeping: false }} />
          {!mailboxHasSingleService ? (
            <ACAvatarCircle2
              avatar={mailboxAvatar}
              className={classes.mailboxAvatar}
              size={MAILBOX_SIZE}
              resolver={(i) => Resolver.image(i)}
              showSleeping={false} />
          ) : undefined}
        </MailboxServiceBadge>
        <div className={classes.displayName}>
          {displayName}
        </div>
        <div className={classes.documentTitle}>
          {documentTitle}
        </div>
      </div>
    )
  }
}

export default SwitcherServiceCell
