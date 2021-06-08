import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import styles from './AppSceneWindowTitlebarStyles'
import FASTimesIcon from 'wbfa/FASTimes'
import FARTimesIcon from 'wbfa/FARTimes'
import FARSquareIcon from 'wbfa/FARSquare'
import FARWindowMinimizeIcon from 'wbfa/FARWindowMinimize'
import FASMinusIcon from 'wbfa/FASMinus'
import WBRPCRenderer from 'shared/WBRPCRenderer'

@withStyles(styles)
class AppSceneWindowTitlebar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get preferredHeight () {
    if (process.platform === 'darwin') {
      return 22
    } else {
      return 30
    }
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.__isMounted__ = true

    WBRPCRenderer.browserWindow.on('focus', this.handleWindowStateChange)
    WBRPCRenderer.browserWindow.on('blur', this.handleWindowStateChange)
    if (process.platform === 'darwin') {
      WBRPCRenderer.browserWindow.on('dark-mode-changed', this.handleThemeChanged)
    }
  }

  componentWillUnmount () {
    this.__isMounted__ = false

    WBRPCRenderer.browserWindow.removeListener('focus', this.handleWindowStateChange)
    WBRPCRenderer.browserWindow.removeListener('blur', this.handleWindowStateChange)

    if (process.platform === 'darwin') {
      WBRPCRenderer.browserWindow.removeListener('dark-mode-changed', this.handleThemeChanged)
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      isDarkMode: process.platform === 'darwin'
        ? WBRPCRenderer.browserWindow.isDarkModeSync()
        : false,
      ...this.generateWindowState()
    }
  })()

  handleWindowStateChange = (evt) => {
    // There's a timing issue here with removing the electron window bindings.
    // They're removed just after the component unmounts
    if (!this.__isMounted__) { return }
    this.setState(this.generateWindowState())
  }

  handleThemeChanged = (evt, isDarkMode) => {
    // There's a timing issue here with removing the electron window bindings.
    // They're removed just after the component unmounts
    if (!this.__isMounted__) { return }

    this.setState({ isDarkMode: isDarkMode })
  }

  /**
  * Generates the full window state
  * @return the window state
  */
  generateWindowState () {
    return {
      isFocused: WBRPCRenderer.browserWindow.isFocusedSync()
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Minimizes the window
  * @param evt: the event that fired
  */
  handleClose = (evt) => {
    WBRPCRenderer.browserWindow.close()
  }

  /**
  * Maximizes the window
  * @param evt: the event that fired
  */
  handleMinimize = (evt) => {
    WBRPCRenderer.browserWindow.minimize()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isFocused, isDarkMode } = this.state
    const { style, className, classes, ...passProps } = this.props

    return (
      <div
        style={{
          height: this.constructor.preferredHeight,
          ...style
        }}
        className={classnames(
          classes.titlebar,
          isFocused ? 'focused' : undefined,
          isDarkMode ? 'dark' : undefined,
          className
        )}
        {...passProps}>
        <div className='title'>Wavebox Mini</div>
        <div className='controls'>
          <div className='control close' onClick={this.handleClose}>
            {process.platform === 'darwin' ? (
              <FASTimesIcon className='icon' />
            ) : (
              <FARTimesIcon className='icon' />
            )}
          </div>
          <div className='control maximize'>
            {process.platform === 'darwin' ? undefined : (
              <FARSquareIcon className='icon' />
            )}
          </div>
          <div className='control minimize' onClick={this.handleMinimize}>
            {process.platform === 'darwin' ? (
              <FASMinusIcon className='icon' />
            ) : (
              <FARWindowMinimizeIcon className='icon' />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default AppSceneWindowTitlebar
