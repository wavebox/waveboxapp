import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%'
  },
  img: {
    textIndent: -100000,
    objectFit: 'cover',
    objectPosition: 'center',
    width: '100%',
    height: '100%'
  },
  text: {
    textAlign: 'center',
    color: 'white'
  },
  restricted: {
    filter: 'grayscale(100%)'
  },
  sleeping: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class ACAvatarCircle2Content extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    img: PropTypes.string,
    text: PropTypes.string,
    size: PropTypes.number.isRequired,
    showSleeping: PropTypes.bool.isRequired,
    showRestricted: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      img,
      text,
      size,
      className,
      style,
      classes,
      showSleeping,
      showRestricted,
      ...passProps
    } = this.props

    if (img) {
      return (
        <img
          src={img}
          draggable={false}
          style={style}
          className={classNames(
            className,
            classes.root,
            classes.img,
            showSleeping ? classes.sleeping : undefined,
            showRestricted ? classes.restricted : undefined
          )}
          {...passProps} />
      )
    } else {
      return (
        <span
          style={{
            fontSize: Math.round(size * 0.45),
            lineHeight: `${size}px`,
            ...style
          }}
          className={classNames(
            className,
            classes.root,
            classes.text,
            showSleeping ? classes.sleeping : undefined,
            showRestricted ? classes.restricted : undefined
          )}
          {...passProps}>
          {text}
        </span>
      )
    }
  }
}

export default ACAvatarCircle2Content
