import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    backgroundColor: '#FFF',
    borderRadius: '50%'
  },
  rootXS: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  restricted: {
    filter: 'grayscale(100%)'
  },
  sleeping: {
    filter: 'grayscale(100%)'
  }
}

@withStyles(styles)
class ACAvatarCircle2Background extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    backgroundColor: PropTypes.string,
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
      backgroundColor,
      className,
      style,
      classes,
      showSleeping,
      showRestricted,
      size,
      ...passProps
    } = this.props

    return (
      <div
        className={classNames(
          classes.root,
          className,
          size < 30 ? classes.rootXS : undefined,
          showSleeping ? classes.sleeping : undefined,
          showRestricted ? classes.restricted : undefined
        )}
        style={{
          backgroundColor: backgroundColor,
          ...style
        }}
        {...passProps} />
    )
  }
}

export default ACAvatarCircle2Background
