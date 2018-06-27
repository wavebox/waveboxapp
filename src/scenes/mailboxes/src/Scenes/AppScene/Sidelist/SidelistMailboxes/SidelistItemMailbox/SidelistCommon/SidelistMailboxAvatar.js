import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxAvatar from 'wbui/MailboxAvatar'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'

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
class SidelistMailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    avatar: PropTypes.object.isRequired,
    size: PropTypes.number.isRequired,
    isSleeping: PropTypes.bool.isRequired,
    showColorRing: PropTypes.bool.isRequired,
    borderColor: PropTypes.string.isRequired,
    borderWidth: PropTypes.number.isRequired
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
      borderColor,
      borderWidth,
      style,
      ...passProps
    } = this.props

    return (
      <MailboxAvatar
        avatar={avatar}
        size={size}
        resolver={(i) => Resolver.image(i)}
        className={classNames(classes.avatar, isSleeping ? classes.sleeping : undefined, className)}
        style={{
          boxShadow: showColorRing ? `0 0 0 ${borderWidth}px ${borderColor}` : 'none',
          ...style
        }}
        {...passProps} />
    )
  }
}

export default SidelistMailboxAvatar
