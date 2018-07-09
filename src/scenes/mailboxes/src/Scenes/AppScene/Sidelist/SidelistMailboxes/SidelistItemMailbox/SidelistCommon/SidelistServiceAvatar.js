import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'
import Color from 'color'

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
class SidelistServiceAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.object.isRequired,
    size: PropTypes.number.isRequired,
    isSleeping: PropTypes.bool.isRequired,
    showColorRing: PropTypes.bool.isRequired,
    borderWidth: PropTypes.number.isRequired,
    lightenBorder: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      avatar,
      size,
      className,
      classes,
      isSleeping,
      showColorRing,
      lightenBorder,
      borderWidth,
      style,
      ...passProps
    } = this.props

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
        className={classNames(classes.avatar, isSleeping ? classes.sleeping : undefined, className)}
        style={{ boxShadow: boxShadow, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistServiceAvatar
