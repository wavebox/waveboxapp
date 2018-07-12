import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import { basicPopoverStyles400w } from 'wbui/Styles/PopoverStyles'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import FAIcon from 'wbui/FAIcon'
import { faExclamation } from '@fortawesome/pro-solid-svg-icons/faExclamation'
import { faGem } from '@fortawesome/pro-regular-svg-icons/faGem'
import { accountStore } from 'stores/account'

const styles = {
  hr: {
    height: 1,
    border: 0,
    backgroundImage: 'linear-gradient(to right, #bcbcbc, #fff, #bcbcbc)'
  },
  proIcon: {
    color: 'white',
    fontSize: 14,
    marginRight: 2
  },
  authInvalidText: {
    color: red['A200']
  },
  authInvalidIcon: {
    color: red['A200'],
    width: 14,
    height: 14,
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...ReactPortalTooltip.propTypes,
    serviceId: PropTypes.string.isRequired
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
      this.setState(this.generateServiceState(nextProps.serviceId))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateServiceState(this.props.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateServiceState(this.props.serviceId, accountState))
  }

  /**
  * @param serviceId: the id of the service
  * @param accountState=autoget: the current account state
  * @return state object
  */
  generateServiceState (serviceId, accountState = accountStore.getState()) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return mailbox && service && serviceData ? {
      hasMembers: true,
      displayName: accountState.resolvedServiceDisplayName(serviceId, mailbox.displayName),
      isRestricted: accountState.isServiceRestricted(serviceId),
      supportsUnreadCount: service.supportsUnreadCount,
      supportsUnreadActivity: service.supportsUnreadActivity,
      humanizedUnreadItemType: service.humanizedUnreadItemType,
      humanizedServiceType: service.humanizedTypeShort,
      isAuthenticationInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
      unreadCount: serviceData.getUnreadCount(service),
      hasUnreadActivity: serviceData.getHasUnreadActivity(service)
    } : {
      hasMembers: false
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
      ...passProps
    } = this.props
    const {
      displayName,
      isRestricted,
      supportsUnreadCount,
      supportsUnreadActivity,
      isAuthenticationInvalid,
      humanizedUnreadItemType,
      unreadCount,
      hasUnreadActivity,
      humanizedServiceType,
      hasMembers
    } = this.state
    if (!hasMembers) { return false }

    let unreadContent
    if (isRestricted) {
      unreadContent = (
        <span>
          <FAIcon icon={faGem} className={classes.proIcon} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (isAuthenticationInvalid) {
      unreadContent = (
        <span className={classes.authInvalidText}>
          <FAIcon icon={faExclamation} className={classes.authInvalidIcon} />
          <span>Authentication Problem. Right click to reauthenticate</span>
        </span>
      )
    } else if (supportsUnreadCount || supportsUnreadActivity) {
      const unreadType = humanizedUnreadItemType
      if (supportsUnreadCount && unreadCount > 0) {
        const count = unreadCount
        unreadContent = `${count} unread ${unreadType}${count === 1 ? '' : 's'}`
      } else if (supportsUnreadActivity && hasUnreadActivity) {
        unreadContent = `New unseen ${unreadType}s`
      } else {
        unreadContent = `No unread ${unreadType}s`
      }
    }

    return (
      <ReactPortalTooltip {...passProps} style={basicPopoverStyles400w}>
        <div>
          {humanizedServiceType === displayName ? (
            humanizedServiceType
          ) : (
            `${humanizedServiceType} : ${displayName}`
          )}
        </div>
        {unreadContent ? (
          <div>
            <hr className={classes.hr} />
            <div>{unreadContent}</div>
          </div>
        ) : undefined}
      </ReactPortalTooltip>
    )
  }
}

export default ServiceTooltip
