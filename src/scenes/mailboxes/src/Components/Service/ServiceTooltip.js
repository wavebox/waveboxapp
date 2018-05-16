import PropTypes from 'prop-types'
import React from 'react'
import { FontIcon } from 'material-ui' //TODO
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import * as Colors from 'material-ui/styles/colors' //TODO
import { basicPopoverStyles400w } from 'sharedui/Components/Toolbar/ToolbarPopoverStyles'

const styles = {
  hr: {
    height: 1,
    border: 0,
    backgroundImage: 'linear-gradient(to right, #bcbcbc, #fff, #bcbcbc)'
  }
}

export default class ServiceTooltip extends React.Component {
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
      ...passProps
    } = this.props

    if (!mailbox.displayName) { return false }

    let unreadContent
    if (isRestricted) {
      unreadContent = (
        <span>
          <FontIcon className='far fa-fw fa-gem' style={{ color: 'white', fontSize: 14, marginRight: 2 }} />
          <span>Upgrade to Pro</span>
        </span>
      )
    } else if (mailbox.isAuthenticationInvalid) {
      unreadContent = (
        <span style={{ color: Colors.redA200 }}>
          <FontIcon className='fas fa-fw fa-exclamation-circle' style={{ color: Colors.redA200, fontSize: 16, marginRight: 2 }} />
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
            <hr style={styles.hr} />
            <div>{unreadContent}</div>
          </div>
        ) : undefined}
      </ReactPortalTooltip>
    )
  }
}
