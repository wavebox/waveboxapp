import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'

const styles = {
  badge: {
    position: 'absolute',
    height: 24,
    minWidth: 24,
    fontSize: '13px',
    borderRadius: 12,
    lineHeight: '24px',
    top: -6,
    right: 4,
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 4,
    paddingRight: 4
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 16
  },
  badgeContainer: {
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 0,
    paddingRight: 0,
    display: 'block',
    cursor: 'pointer'
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
