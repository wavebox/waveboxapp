import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  img: {
    textIndent: -100000 // Stops showing the broken image icon if the url doesn't resolve
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

    // Use a box shadow hack rather than border to fix a phantom white line
    // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
    // This has the side effect of now overflowing the element, so try to be a bit intelligent about
    // reducing the size depending on the passed props
    const generatedStyle = {
      backgroundColor: avatar.hasAvatar ? 'white' : avatar.color
    }

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
          (otherProps.classes || {}).img
        )
      },
      className: classNames(
        className,
        showSleeping ? classes.sleeping : undefined
      ),
      style: {
        ...generatedStyle,
        ...style
      }
    }

    if (avatar.hasAvatar) {
      return (<Avatar {...passProps} src={avatar.resolveAvatar(resolver)} />)
    } else if (avatar.avatarCharacterDisplay) {
      if (showRestricted) {
        return (
          <Avatar
            {...passProps}
            className={classNames(passProps.className, classes.restrictedCharacterDisplay)}>
            {avatar.avatarCharacterDisplay}
          </Avatar>
        )
      } else {
        return (<Avatar {...passProps}>{avatar.avatarCharacterDisplay}</Avatar>)
      }
    } else if (avatar.hasServiceIcon) {
      if (typeof (preferredImageSize) === 'number') {
        return (<Avatar {...passProps} src={avatar.resolveServiceIconWithSize(preferredImageSize, resolver)} />)
      } else {
        return (<Avatar {...passProps} src={avatar.resolveServiceIcon(resolver)} />)
      }
    } else {
      return (<Avatar {...passProps} />)
    }
  }
}

export default ACAvatarCircle
