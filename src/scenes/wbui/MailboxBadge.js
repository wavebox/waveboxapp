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
    top: -RADIUS,
    right: -RADIUS,
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
    mailbox: PropTypes.object.isRequired,
    unreadCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
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
      unreadCount,
      className,
      children,
      classes,
      ...passProps
    } = this.props
    if (!mailbox) { return false }

    const badgeColor = mailbox.badgeColor
    let inverseBadgeColor
    try {
      inverseBadgeColor = badgeColor ? Color(badgeColor).isLight() ? 'black' : 'white' : undefined
    } catch (ex) {
      inverseBadgeColor = 'white'
    }

    let shouldDisplay = true
    if (unreadCount === 0) {
      shouldDisplay = false
    } else if (typeof (unreadCount) === 'string' && !unreadCount) {
      shouldDisplay = false
    }

    return (
      <span className={classNames(classes.root, className)} {...passProps}>
        {children}
        {shouldDisplay ? (
          <span
            className={classes.badge}
            style={{ backgroundColor: badgeColor, color: inverseBadgeColor }}>
            {unreadCount}
          </span>
        ) : undefined}
      </span>
    )
  }
}

export default MailboxBadge
