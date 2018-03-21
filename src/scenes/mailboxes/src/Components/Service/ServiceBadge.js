import PropTypes from 'prop-types'
import React from 'react'
import { Badge, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import Color from 'color'

export default class Servicebadge extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isAuthInvalid: PropTypes.bool.isRequired,
    supportsUnreadCount: PropTypes.bool.isRequired,
    showUnreadBadge: PropTypes.bool.isRequired,
    unreadCount: PropTypes.number.isRequired,
    supportsUnreadActivity: PropTypes.bool.isRequired,
    showUnreadActivityBadge: PropTypes.bool.isRequired,
    hasUnreadActivity: PropTypes.bool.isRequired,
    color: PropTypes.string,
    badgeStyle: PropTypes.object,
    iconStyle: PropTypes.object
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      isAuthInvalid,
      supportsUnreadCount,
      showUnreadBadge,
      unreadCount,
      supportsUnreadActivity,
      showUnreadActivityBadge,
      hasUnreadActivity,
      color,
      badgeStyle,
      iconStyle,
      style,
      children,
      ...passProps
    } = this.props

    let colorInverse
    try {
      if (color) {
        colorInverse = Color(color).isLight() ? 'black' : 'white'
      }
    } catch (ex) { /* no-op */ }

    let badgeContent
    if (isAuthInvalid) {
      badgeContent = (<FontIcon className='fas fa-exclamation' style={{ ...iconStyle, color: colorInverse }} />)
    } else if (supportsUnreadCount && showUnreadBadge && unreadCount) {
      badgeContent = unreadCount >= 1000 ? Math.floor(unreadCount / 1000) + 'K+' : unreadCount
    } else if (supportsUnreadActivity && showUnreadActivityBadge && hasUnreadActivity) {
      badgeContent = '●'
    }

    if (!badgeContent && !children) { return false }

    return (
      <Badge
        {...passProps}
        badgeContent={badgeContent !== undefined ? badgeContent : ''}
        style={style}
        badgeStyle={{
          ...badgeStyle,
          backgroundColor: color,
          color: colorInverse,
          ...(badgeContent === undefined ? { display: 'none' } : undefined)
        }}>
        {children}
      </Badge>
    )
  }
}
