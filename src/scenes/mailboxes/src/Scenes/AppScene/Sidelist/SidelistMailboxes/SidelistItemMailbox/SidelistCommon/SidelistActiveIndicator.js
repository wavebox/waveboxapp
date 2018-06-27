import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  activeIndicator: {
    position: 'absolute',
    left: 2,
    top: 25,
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}

@withStyles(styles)
class SidelistActiveIndicator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { color, classes, className, style, ...passProps } = this.props

    return (
      <div
        className={classNames(classes.activeIndicator, className)}
        style={{ backgroundColor: color, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistActiveIndicator
