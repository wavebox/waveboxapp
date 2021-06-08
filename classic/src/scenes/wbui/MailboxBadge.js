import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import Color from 'color'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const RADIUS = 12
const styles = {
  root: {
    position: 'relative',
    display: 'inline-flex',
    verticalAlign: 'middle'
  },
  badge: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -RADIUS / 2,
    right: -RADIUS / 2,
    fontSize: RADIUS,
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: '50%',
    zIndex: 1
  }
}

@withStyles(styles)
class MailboxBadge extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string,
    hasUnreadActivity: PropTypes.bool.isRequired,
    unreadCount: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      color,
      unreadCount,
      hasUnreadActivity,
      className,
      children,
      classes,
      ...passProps
    } = this.props

    let inverseBadgeColor
    try {
      inverseBadgeColor = color ? Color(color).isLight() ? 'black' : 'white' : undefined
    } catch (ex) {
      inverseBadgeColor = 'white'
    }

    let badgeContent
    let badgeContentType
    if (unreadCount > 0) {
      badgeContent = unreadCount >= 1000 ? Math.floor(unreadCount / 1000) + 'K+' : unreadCount
      badgeContentType = 'Count'
    } else if (hasUnreadActivity) {
      badgeContent = '●'
      badgeContentType = 'Indicator'
    }

    return (
      <span
        className={classNames(classes.root, className)}
        {...passProps}>
        {children}
        {badgeContent !== undefined ? (
          <span
            className={classNames(
              classes.badge,
              'WB-MailboxBadge',
              `WB-Badge-Content-${badgeContentType}`
            )}
            style={{ backgroundColor: color, color: inverseBadgeColor }}>
            {badgeContent}
          </span>
        ) : undefined}
      </span>
    )
  }
}

export default MailboxBadge
