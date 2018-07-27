import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
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
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.loadbar.backgroundColor'),
    opacity: 0,
    transition: '700ms ease-in-out opacity',

    '&.loading': {
      opacity: 1,
      animationName: 'loadbar',
      animationDelay: '500ms',
      animationDuration: '3s',
      animationFillMode: 'forwards'
    }
  }
})

@withStyles(styles, { withTheme: true })
class BrowserViewLoadBar extends React.Component {
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
      theme,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(classes.loadBar, isLoading ? 'loading' : undefined, className)} />
    )
  }
}

export default BrowserViewLoadBar
