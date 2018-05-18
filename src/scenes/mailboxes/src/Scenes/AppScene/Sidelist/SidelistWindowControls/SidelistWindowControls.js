import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControl from './SidelistWindowControl'
import { remote } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const HAS_WINDOW_CONTROLS = process.platform !== 'darwin'
const styles = {
  placeholder: {
    height: 25,
    minHeight: 25
  },
  container: {
    height: 25,
    width: 70,
    paddingTop: 3,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}

@withStyles(styles)
class SidelistWindowControls extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    if (HAS_WINDOW_CONTROLS) {
      const currentWindow = remote.getCurrentWindow()
      currentWindow.on('maximize', this.handleWindowStateChanged)
      currentWindow.on('unmaximize', this.handleWindowStateChanged)
      currentWindow.on('enter-full-screen', this.handleWindowStateChanged)
      currentWindow.on('leave-full-screen', this.handleWindowStateChanged)
    }
  }

  componentWillUnmount () {
    if (HAS_WINDOW_CONTROLS) {
      const currentWindow = remote.getCurrentWindow()
      currentWindow.removeListener('maximize', this.handleWindowStateChanged)
      currentWindow.removeListener('unmaximize', this.handleWindowStateChanged)
      currentWindow.removeListener('enter-full-screen', this.handleWindowStateChanged)
      currentWindow.removeListener('leave-full-screen', this.handleWindowStateChanged)
    }
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    if (!HAS_WINDOW_CONTROLS) { return {} }

    const currentWindow = remote.getCurrentWindow()
    return {
      isMaximized: currentWindow.isMaximized(),
      isFullScreen: currentWindow.isFullScreen()
    }
  })()

  /* **************************************************************************/
  // Window Events
  /* **************************************************************************/

  handleWindowStateChanged = () => {
    const currentWindow = remote.getCurrentWindow()
    this.setState({
      isMaximized: currentWindow.isMaximized(),
      isFullScreen: currentWindow.isFullScreen()
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the current window
  * @param evt: the event that fired
  */
  handleClose = (evt) => {
    remote.getCurrentWindow().close()
  }

  /**
  * Minimizes the current window
  * @param evt: the event that fired
  */
  handleMinimize = (evt) => {
    const currentWindow = remote.getCurrentWindow()
    if (currentWindow.isFullScreen()) {
      currentWindow.setFullScreen(false)
    }
    currentWindow.minimize()
  }

  /**
  * Maximizes the current window
  * @param evt: the event that fired
  */
  handleMaximize = (evt) => {
    remote.getCurrentWindow().maximize()
  }

  /**
  * Restores the current window
  * @param evt: the event that fired
  */
  handleUnmaximize = (evt) => {
    const currentWindow = remote.getCurrentWindow()
    if (currentWindow.isFullScreen()) {
      currentWindow.setFullScreen(false)
    }
    currentWindow.unmaximize()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, ...passProps } = this.props

    if (HAS_WINDOW_CONTROLS) {
      const { isMaximized, isFullScreen } = this.state
      return (
        <div
          {...passProps}
          className={classNames(classes.container, 'WB-SidelistWindowControls', className)}>
          <SidelistWindowControl type={SidelistWindowControl.TYPES.CLOSE} onClick={this.handleClose} />
          {isFullScreen || isMaximized ? (
            <SidelistWindowControl
              type={isFullScreen ? SidelistWindowControl.TYPES.UNFULLSCREEN : SidelistWindowControl.TYPES.RESTORE}
              onClick={this.handleUnmaximize} />
          ) : (
            <SidelistWindowControl type={SidelistWindowControl.TYPES.MAXIMIZE} onClick={this.handleMaximize} />
          )}
          <SidelistWindowControl type={SidelistWindowControl.TYPES.MINIMIZE} onClick={this.handleMinimize} />
        </div>
      )
    } else {
      return (<div {...passProps} className={classNames(classes.placeholder, className)} />)
    }
  }
}

export default SidelistWindowControls
