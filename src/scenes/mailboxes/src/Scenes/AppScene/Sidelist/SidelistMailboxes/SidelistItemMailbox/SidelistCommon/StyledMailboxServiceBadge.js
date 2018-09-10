import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import MailboxServiceBadge from 'wbui/MailboxServiceBadge'
import PropTypes from 'prop-types'

const styles = {
  badge: {
    position: 'absolute',
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',

    '&.sidebar-regular': {
      height: 24,
      minWidth: 24,
      fontSize: '13px',
      borderRadius: 12,
      lineHeight: '24px',
      top: -6,
      right: 4,
      paddingLeft: 4,
      paddingRight: 4
    },
    '&.sidebar-compact': {
      height: 20,
      minWidth: 20,
      fontSize: '12px',
      borderRadius: 10,
      lineHeight: '20px',
      top: -6,
      right: 1,
      paddingLeft: 5,
      paddingRight: 5
    },
    '&.sidebar-tiny': {
      height: 16,
      minWidth: 16,
      fontSize: '11px',
      borderRadius: 8,
      lineHeight: '16px',
      top: -3,
      right: 1,
      paddingLeft: 3,
      paddingRight: 3
    }
  },
  badgeFAIcon: {
    color: 'white',
    '&.sidebar-regular': { fontSize: 16 },
    '&.sidebar-compact': { fontSize: 12 },
    '&.sidebar-tiny': { fontSize: 11 }
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
  // Class
  /* **************************************************************************/

  static propTypes = {
    sidebarSize: PropTypes.string.isRequired
  }

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
      sidebarSize,
      ...passProps
    } = this.props

    const sidebarSizeCNMod = `sidebar-${sidebarSize.toLowerCase()}`

    return (
      <MailboxServiceBadge
        badgeClassName={classNames(classes.badge, sidebarSizeCNMod, badgeClassName)}
        className={classNames(classes.badgeContainer, className)}
        iconClassName={classNames(classes.badgeFAIcon, sidebarSizeCNMod, iconClassName)}
        {...passProps} />
    )
  }
}

export default StyledMailboxServiceBadge
