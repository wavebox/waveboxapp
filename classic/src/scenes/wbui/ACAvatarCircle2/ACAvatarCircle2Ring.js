import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: '50%',
    borderStyle: 'solid'
  },
  restricted: {
    filter: 'grayscale(100%)'
  },
  sleeping: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class ACAvatarCircle2Ring extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string,
    width: PropTypes.number,
    show: PropTypes.bool.isRequired,
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
      color,
      width,
      className,
      style,
      classes,
      show,
      showSleeping,
      showRestricted,
      ...passProps
    } = this.props
    if (!show) { return false }

    return (
      <div
        className={classNames(
          className,
          classes.root,
          showSleeping ? classes.sleeping : undefined,
          showRestricted ? classes.restricted : undefined
        )}
        style={{
          borderColor: color,
          borderWidth: width,
          ...style
        }}
        {...passProps} />
    )
  }
}

export default ACAvatarCircle2Ring
