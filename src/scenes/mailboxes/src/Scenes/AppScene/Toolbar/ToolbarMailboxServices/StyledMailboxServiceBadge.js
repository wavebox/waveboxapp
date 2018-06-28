import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'
import red from '@material-ui/core/colors/red'

const styles = {
  badge: {
    position: 'absolute',
    height: 14,
    minWidth: 14,
    fontSize: '11px',
    borderRadius: 3,
    lineHeight: '14px',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: red[50],
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 2,
    paddingRight: 2
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 10
  },
  badgeContainer: {
    padding: 0,
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

@withStyles(styles)
class StyledMailboxServiceBadge extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      badgeClassName,
      className,
      iconClassName,
      classes,
      ...passProps
    } = this.props

    return (
      <MailboxServiceBadge
        badgeClassName={classNames(classes.badge, badgeClassName)}
        className={classNames(classes.badgeContainer, className)}
        iconClassName={classNames(classes.badgeFAIcon, iconClassName)}
        {...passProps} />
    )
  }
}

export default StyledMailboxServiceBadge
