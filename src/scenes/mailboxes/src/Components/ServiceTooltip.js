import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import { accountStore } from 'stores/account'
import DefaultTooltip400w from 'wbui/Tooltips/DefaultTooltip400w'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FARGemIcon from 'wbfa/FARGem'
import FASExclamationIcon from 'wbfa/FASExclamation'

const styles = (theme) => ({
  root: {
    textAlign: 'center'
  },
  hr: {
    height: 1,
    border: 0,
    backgroundImage: `linear-gradient(to right, ${ThemeTools.getValue(theme, 'wavebox.popover.hr.backgroundGradientColors')})`
  },
  proIcon: {
    color: ThemeTools.getValue(theme, 'wavebox.popover.color'),
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
})

@withStyles(styles, { withTheme: true })
class ServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
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
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
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
      theme,
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
          <FARGemIcon className={classes.proIcon} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (isAuthenticationInvalid) {
      unreadContent = (
        <span className={classes.authInvalidText}>
          <FASExclamationIcon className={classes.authInvalidIcon} />
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
      <DefaultTooltip400w {...passProps}>
        <div className={classes.root}>
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
        </div>
      </DefaultTooltip400w>
    )
  }
}

export default ServiceTooltip
