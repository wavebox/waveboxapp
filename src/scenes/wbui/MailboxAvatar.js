import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'

export default class MailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    resolvedAvatar: PropTypes.string,
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
      mailbox,
      resolvedAvatar,
      style,
      size,
      ...otherProps
    } = this.props
    if (!mailbox) { return false }

    // Use a box shadow hack rather than border to fix a phantom white line
    // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
    // This has the side effect of now overflowing the element, so try to be a bit intelligent about
    // reducing the size depending on the passed props
    const generatedStyle = {
      backgroundColor: mailbox.hasCustomAvatar || mailbox.avatarURL ? 'white' : mailbox.color
    }

    if (mailbox.showAvatarColorRing) {
      const borderSize = Math.round(size * 0.08)
      const adjustedSize = size - (2 * borderSize)
      generatedStyle.width = adjustedSize
      generatedStyle.height = adjustedSize
      generatedStyle.boxShadow = `0 0 0 ${borderSize}px ${mailbox.color}`
    } else {
      generatedStyle.width = size
      generatedStyle.height = size
    }

    const passProps = {
      draggable: false,
      ...otherProps,
      style: {
        ...generatedStyle,
        ...style
      }
    }

    if (resolvedAvatar) {
      return (<Avatar {...passProps} src={resolvedAvatar} />)
    } else if (mailbox.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{mailbox.avatarCharacterDisplay}</Avatar>)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
}
