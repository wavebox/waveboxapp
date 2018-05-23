import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import classnames from 'classnames'
import { remote } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import styles from './AppSceneWindowTitlebarStyles'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import farTimes from '@fortawesome/fontawesome-pro-regular/faTimes'
import fasTimes from '@fortawesome/fontawesome-pro-solid/faTimes'
import farSquare from '@fortawesome/fontawesome-pro-regular/faSquare'
import fasMinus from '@fortawesome/fontawesome-pro-solid/faMinus'
import farWindowMinimize from '@fortawesome/fontawesome-pro-regular/faWindowMinimize'

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
    const currentWindow = remote.getCurrentWindow()
    currentWindow.on('focus', this.handleWindowStateChange)
    currentWindow.on('blur', this.handleWindowStateChange)
  }

  componentWillUnmount () {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.removeListener('focus', this.handleWindowStateChange)
    currentWindow.removeListener('blur', this.handleWindowStateChange)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateWindowState()
    }
  })()

  handleWindowStateChange = (evt) => {
    this.setState(this.generateWindowState())
  }

  /**
  * Generates the full window state
  * @return the window state
  */
  generateWindowState () {
    const currentWindow = remote.getCurrentWindow()
    return {
      isFocused: currentWindow.isFocused()
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
    remote.getCurrentWindow().close()
  }

  /**
  * Maximizes the window
  * @param evt: the event that fired
  */
  handleMinimize = (evt) => {
    remote.getCurrentWindow().minimize()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isFocused } = this.state
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
          className
        )}
        {...passProps}>
        <div className='title'>Wavebox Mini</div>
        <div className='controls'>
          <div className='control close' onClick={this.handleClose}>
            {process.platform === 'darwin' ? (
              <FontAwesomeIcon icon={fasTimes} />
            ) : (
              <FontAwesomeIcon icon={farTimes} />
            )}
          </div>
          <div className='control maximize'>
            {process.platform === 'darwin' ? undefined : (
              <FontAwesomeIcon icon={farSquare} />
            )}
          </div>
          <div className='control minimize' onClick={this.handleMinimize}>
            {process.platform === 'darwin' ? (
              <FontAwesomeIcon icon={fasMinus} />
            ) : (
              <FontAwesomeIcon icon={farWindowMinimize} />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default AppSceneWindowTitlebar
