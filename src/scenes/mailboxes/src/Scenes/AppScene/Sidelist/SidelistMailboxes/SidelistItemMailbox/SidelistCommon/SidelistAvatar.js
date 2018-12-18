import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'
import Color from 'color'
import UISettings from 'shared/Models/Settings/UISettings'

const styles = {
  avatar: {
    display: 'block',
    margin: '4px auto',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
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
    showSleeping: PropTypes.bool.isRequired,
    showColorRing: PropTypes.bool.isRequired,
    lightenBorder: PropTypes.bool.isRequired,
    circleProps: PropTypes.object
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
        return { size: 38, borderWidth: 3 }
      case UISettings.SIDEBAR_SIZES.TINY:
        return { size: 28, borderWidth: 2 }
      case UISettings.SIDEBAR_SIZES.REGULAR:
      default:
        return { size: 44, borderWidth: 3 }
    }
  }

  render () {
    const {
      avatar,
      sidebarSize,
      className,
      classes,
      isSleeping,
      showSleeping,
      showColorRing,
      lightenBorder,
      circleProps,
      ...passProps
    } = this.props

    const { size, borderWidth } = this.renderSizesFromSidebarSize(sidebarSize)

    let borderColor = avatar.color
    if (lightenBorder) {
      try {
        borderColor = Color(avatar.color).lighten(0.4).rgb().string()
      } catch (ex) { }
    }

    return (
      <ACAvatarCircle2
        avatar={avatar}
        size={size}
        resolver={(i) => Resolver.image(i)}
        showSleeping={showSleeping && isSleeping}
        className={classNames(classes.avatar, className)}
        circleProps={{
          width: borderWidth,
          color: borderColor,
          ...circleProps
        }}
        {...passProps} />
    )
  }
}

export default SidelistAvatar
