import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import blue from '@material-ui/core/colors/blue'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  '@keyframes loadbar': {
    '0%': { width: '10%' },
    '100%': { width: '90%;' }
  },
  loadBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 3,
    backgroundColor: blue[600],
    opacity: 0,
    zIndex: 2, // Ensures it appears over the webview & dropshadow of toolbar
    transition: '700ms ease-in-out opacity',

    '&.loading': {
      opacity: 1,
      animationName: 'loadbar',
      animationDelay: '500ms',
      animationDuration: '3s',
      animationFillMode: 'forwards'
    }
  }
}

@withStyles(styles)
class WaveboxWebViewLoadbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isLoading: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      isLoading,
      className,
      classes,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(classes.loadBar, isLoading ? 'loading' : undefined, className)} />
    )
  }
}

export default WaveboxWebViewLoadbar
