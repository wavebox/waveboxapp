import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  img: {
    textIndent: -100000 // Stops showing the broken image icon if the url doesn't resolve
  }
}

@withStyles(styles)
class MailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.object.isRequired,
    resolver: PropTypes.func.isRequired,
    size: PropTypes.number.isRequired
  }

  static defaultProps = {
    size: 40
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
      ...otherProps
    } = this.props

    // Use a box shadow hack rather than border to fix a phantom white line
    // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
    // This has the side effect of now overflowing the element, so try to be a bit intelligent about
    // reducing the size depending on the passed props
    const generatedStyle = {
      backgroundColor: avatar.hasAvatar ? 'white' : avatar.color
    }

    const borderSize = Math.round(size * 0.08)
    const adjustedSize = size - (2 * borderSize)
    generatedStyle.width = adjustedSize
    generatedStyle.height = adjustedSize
    generatedStyle.lineHeight = `${adjustedSize}px`
    if (avatar.showAvatarColorRing) {
      generatedStyle.boxShadow = `0 0 0 ${borderSize}px ${avatar.color}`
    }

    const passProps = {
      ...otherProps,
      imgProps: {
        draggable: false,
        ...otherProps.imgProps
      },
      classes: {
        ...otherProps.classes,
        img: classNames(classes.img, (otherProps.classes || {}).img)
      },
      style: {
        ...generatedStyle,
        ...style
      }
    }

    if (avatar.hasAvatar) {
      return (<Avatar {...passProps} src={avatar.resolveAvatar(resolver)} />)
    } else if (avatar.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{avatar.avatarCharacterDisplay}</Avatar>)
    } else if (avatar.hasServiceIcon) {
      return (<Avatar {...passProps} src={avatar.resolveServiceIcon(resolver)} />)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
}

export default MailboxAvatar
