import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'
import Color from 'color'
import UISettings from 'shared/Models/Settings/UISettings'

const styles = {
  avatar: {
    display: 'block',
    transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
    margin: '4px auto',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  sleeping: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class SidelistAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.object.isRequired,
    sidebarSize: PropTypes.string.isRequired,
    isSleeping: PropTypes.bool.isRequired,
    showColorRing: PropTypes.bool.isRequired,
    lightenBorder: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Gets the sizes for the given sidebar size
  * @param sidebarSize: the sidebar config size
  * @return { size, borderWidth }
  */
  renderSizesFromSidebarSize (sidebarSize) {
    switch (sidebarSize) {
      case UISettings.SIDEBAR_SIZES.COMPACT:
        return { size: 38, borderWidth: 4 }
      case UISettings.SIDEBAR_SIZES.TINY:
        return { size: 28, borderWidth: 3 }
      case UISettings.SIDEBAR_SIZES.REGULAR:
      default:
        return { size: 44, borderWidth: 4 }
    }
  }

  render () {
    const {
      avatar,
      sidebarSize,
      className,
      classes,
      isSleeping,
      showColorRing,
      lightenBorder,
      style,
      ...passProps
    } = this.props
    const { size, borderWidth } = this.renderSizesFromSidebarSize(sidebarSize)

    let boxShadow
    if (showColorRing) {
      if (lightenBorder) {
        try {
          const col = Color(avatar.color).lighten(0.4).rgb().string()
          boxShadow = `0 0 0 ${borderWidth}px ${col}`
        } catch (ex) {
          boxShadow = `0 0 0 ${borderWidth}px ${avatar.color}`
        }
      } else {
        boxShadow = `0 0 0 ${borderWidth}px ${avatar.color}`
      }
    } else {
      boxShadow = 'none'
    }

    return (
      <ACAvatarCircle
        avatar={avatar}
        size={size}
        resolver={(i) => Resolver.image(i)}
        showSleeping={isSleeping}
        className={classNames(classes.avatar, className)}
        style={{ boxShadow: boxShadow, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistAvatar
