import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ACAvatarCircle2Background from './ACAvatarCircle2Background'
import ACAvatarCircle2Content from './ACAvatarCircle2Content'
import ACAvatarCircle2Ring from './ACAvatarCircle2Ring'

const styles = {
  root: {
    position: 'relative'
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
    backgroundProps: PropTypes.object,
    contentProps: PropTypes.object,
    circleProps: PropTypes.object
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

  /**
  * @param avatar: the avatar to read from
  * @param resolver: the resolver to fetch images
  * @param preferredImageSize: the image size to return
  * @return an image src or undefined if not relevant
  */
  getImageSrc (avatar, resolver, preferredImageSize) {
    if (avatar.hasAvatar) {
      return avatar.resolveAvatar(resolver)
    } else if (avatar.avatarCharacterDisplay) {
      return undefined
    } else if (avatar.hasServiceIcon) {
      return typeof (preferredImageSize) === 'number'
        ? avatar.resolveServiceIconWithSize(preferredImageSize, resolver)
        : avatar.resolveServiceIcon(resolver)
    } else {
      return undefined
    }
  }

  render () {
    const {
      avatar,
      resolver,
      size,
      showSleeping,
      showRestricted,
      preferredImageSize,
      backgroundProps,
      contentProps,
      circleProps,
      className,
      classes,
      style,
      ...passProps
    } = this.props

    const img = this.getImageSrc(avatar, resolver, preferredImageSize)
    return (
      <div
        className={classNames(className, classes.root)}
        style={{
          width: size,
          minWidth: size,
          height: size,
          minHeight: size,
          ...style
        }}
        {...passProps}>
        <ACAvatarCircle2Background
          backgroundColor={!img ? avatar.color : undefined}
          size={size}
          showSleeping={showSleeping}
          showRestricted={showRestricted}
          {...backgroundProps} />
        <ACAvatarCircle2Content
          img={img}
          text={avatar.avatarCharacterDisplay}
          size={size}
          showSleeping={showSleeping}
          showRestricted={showRestricted}
          {...contentProps} />
        <ACAvatarCircle2Ring
          color={avatar.color}
          width={Math.round(size * 0.08)}
          show={avatar.showAvatarColorRing}
          showSleeping={showSleeping}
          showRestricted={showRestricted}
          {...circleProps} />
      </div>
    )
  }
}

export default ACAvatarCircle
