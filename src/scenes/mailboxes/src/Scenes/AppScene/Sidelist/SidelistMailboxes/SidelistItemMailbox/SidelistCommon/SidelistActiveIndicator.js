import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  activeIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: '50%',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',

    '&.sidebar-regular': {
      left: 2,
      top: 20
    },
    '&.sidebar-compact': {
      left: 1,
      top: 18
    },
    '&.sidebar-tiny': {
      left: -2,
      top: 14
    }
  }
}

@withStyles(styles)
class SidelistActiveIndicator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string.isRequired,
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
      color,
      classes,
      className,
      style,
      sidebarSize,
      ...passProps
    } = this.props

    return (
      <div
        className={classNames(classes.activeIndicator, `sidebar-${sidebarSize.toLowerCase()}`, className)}
        style={{ backgroundColor: color, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistActiveIndicator
