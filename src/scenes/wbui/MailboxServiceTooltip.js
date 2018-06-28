import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import { basicPopoverStyles400w } from 'wbui/Styles/PopoverStyles'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasExclamation from '@fortawesome/fontawesome-pro-solid/faExclamation'
import farGem from '@fortawesome/fontawesome-pro-regular/faGem'

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
//TODO depricate. I've moved into components
@withStyles(styles)
class MailboxServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...ReactPortalTooltip.propTypes,
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired,
    isRestricted: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      service,
      isRestricted,
      classes,
      ...passProps
    } = this.props

    if (!mailbox.displayName) { return false }

    let unreadContent
    if (isRestricted) {
      unreadContent = (
        <span>
          <FontAwesomeIcon icon={farGem} className={classes.proIcon} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (mailbox.isAuthenticationInvalid) {
      unreadContent = (
        <span className={classes.authInvalidText}>
          <FontAwesomeIcon icon={fasExclamation} className={classes.authInvalidIcon} />
          <span>Authentication Problem. Right click to reauthenticate</span>
        </span>
      )
    } else if (service.supportsUnreadCount || service.supportsUnreadActivity) {
      const unreadType = service.humanizedUnreadItemType
      if (service.supportsUnreadCount && service.unreadCount > 0) {
        const count = service.unreadCount
        unreadContent = `${count} unread ${unreadType}${count === 1 ? '' : 's'}`
      } else if (service.supportsUnreadActivity && service.hasUnreadActivity) {
        unreadContent = `New unseen ${unreadType}s`
      } else {
        unreadContent = `No unread ${unreadType}s`
      }
    }

    return (
      <ReactPortalTooltip {...passProps} style={basicPopoverStyles400w}>
        <div>
          {`${service.humanizedTypeShort} : ${mailbox.displayName}`}
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

export default MailboxServiceTooltip
