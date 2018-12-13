import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

let warningShown = false
const styles = {
  container: {
    // Makes the box-shadow render when border radius is used
    transform: 'translate3d(0,0,0)',

    // White ring fix part 1/3 (2-lines)
    // https://css-tricks.com/forums/topic/border-radius-ugliness/
    '&.with-ring': {
      backgroundClip: 'content-box',
      padding: 1
    }
  },
  img: {
    textIndent: -100000, // Stops showing the broken image icon if the url doesn't resolve
    // White ring fix part 2/3 (3-lines)
    '&.with-ring': {
      margin: -1,
      width: 'calc(100% + 2px)',
      height: 'calc(100% + 2px)'
    }
  },
  sleeping: {
    filter: 'grayscale(100%)'
  },
  restricted: {
    backgroundColor: '#EEE',
    filter: 'grayscale(100%)'
  },
  restrictedCharacterDisplay: {
    backgroundColor: '#BBB !important',
    color: '#FFF !important'
  }
}

@withStyles(styles)
class ACAvatarCircle extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.object.isRequired,
    resolver: PropTypes.func.isRequired,
    size: PropTypes.number.isRequired,
    showSleeping: PropTypes.bool.isRequired,
    showRestricted: PropTypes.bool.isRequired,
    preferredImageSize: PropTypes.number,
    borderSize: PropTypes.number
  }

  static defaultProps = {
    size: 40,
    showSleeping: false,
    showRestricted: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (!warningShown) {
      warningShown = true
      console.warn('ACAvatarCircle has been depricated. Instead use ACAvatarCircle2')
    }

    const {
      avatar,
      resolver,
      style,
      size,
      classes,
      className,
      showSleeping,
      showRestricted,
      preferredImageSize,
      borderSize,
      ...otherProps
    } = this.props

    const generatedStyle = {
      backgroundColor: 'white'
    }

    // Style: Border size and color
    // Use a box shadow hack rather than border to fix a phantom white line
    // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
    // This has the side effect of now overflowing the element, so try to be a bit intelligent about
    // reducing the size depending on the passed props
    const generatedBorderSize = typeof (borderSize) === 'number' ? borderSize : Math.round(size * 0.08)
    const adjustedSize = size - (2 * generatedBorderSize)
    generatedStyle.width = adjustedSize
    generatedStyle.height = adjustedSize
    generatedStyle.lineHeight = `${adjustedSize}px`
    if (avatar.showAvatarColorRing) {
      generatedStyle.boxShadow = `0 0 0 ${generatedBorderSize}px ${avatar.color}`
    }

    const passProps = {
      ...otherProps,
      imgProps: {
        draggable: false,
        ...otherProps.imgProps
      },
      classes: {
        ...otherProps.classes,
        img: classNames(
          classes.img,
          showRestricted ? classes.restricted : undefined,
          avatar.showAvatarColorRing ? 'with-ring' : undefined,
          (otherProps.classes || {}).img
        )
      },
      className: classNames(
        className,
        classes.container,
        showSleeping ? classes.sleeping : undefined,
        avatar.showAvatarColorRing ? 'with-ring' : undefined
      )
    }

    if (avatar.hasAvatar) {
      return (
        <Avatar
          {...passProps}
          style={{ ...generatedStyle, ...style }}
          src={avatar.resolveAvatar(resolver)} />
      )
    } else if (avatar.avatarCharacterDisplay) {
      const charaterStyle = {
        ...generatedStyle,
        backgroundColor: avatar.color,
        fontSize: Math.round(adjustedSize * 0.55),
        padding: 0, // White ring fix part 3/3
        ...style
      }

      if (showRestricted) {
        return (
          <Avatar
            {...passProps}
            className={classNames(passProps.className, classes.restrictedCharacterDisplay)}
            style={charaterStyle}>
            {avatar.avatarCharacterDisplay}
          </Avatar>
        )
      } else {
        return (
          <Avatar
            {...passProps}
            style={charaterStyle}>
            {avatar.avatarCharacterDisplay}
          </Avatar>
        )
      }
    } else if (avatar.hasServiceIcon) {
      const src = typeof (preferredImageSize) === 'number'
        ? avatar.resolveServiceIconWithSize(preferredImageSize, resolver)
        : avatar.resolveServiceIcon(resolver)

      return (
        <Avatar
          {...passProps}
          style={{ ...generatedStyle, ...style }}
          src={src} />
      )
    } else {
      return (
        <Avatar
          {...passProps}
          style={{ ...generatedStyle, ...style }} />)
    }
  }
}

export default ACAvatarCircle
