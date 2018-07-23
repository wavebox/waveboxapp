import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControl from './SidelistWindowControl'
import { remote } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { settingsStore } from 'stores/settings'
import ThemeTools from 'wbui/Themes/ThemeTools'

const HAS_WINDOW_CONTROLS = process.platform !== 'darwin'
const styles = (theme) => ({
  placeholder: {
    height: 25,
    minHeight: 25,
    width: '100%',
    position: 'relative',

    '&.darwin': {
      '&:after': {
        position: 'fixed',
        content: '""',
        display: 'block',
        top: 0,
        left: 0,
        height: 25,
        width: 70,
        backgroundColor: ThemeTools.getValue(theme, 'wavebox.sidebar.backgroundColor'),
        borderBottomRightRadius: 8
      },

      '&.fullscreen': {
        display: 'none',
        '&:after': {
          display: 'none'
        }
      }
    }
  },
  container: {
    height: 25,
    width: '100%',
    paddingTop: 3,
    paddingBottom: 2,
    textAlign: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    lineHeight: '1em',
    verticalAlign: 'middle'
  }
})

@withStyles(styles, { withTheme: true })
class SidelistWindowControls extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    const currentWindow = remote.getCurrentWindow()
    if (HAS_WINDOW_CONTROLS) {
      currentWindow.on('maximize', this.handleWindowStateChanged)
      currentWindow.on('unmaximize', this.handleWindowStateChanged)
      currentWindow.on('enter-full-screen', this.handleWindowStateChanged)
      currentWindow.on('leave-full-screen', this.handleWindowStateChanged)
      settingsStore.listen(this.settingsChanged)
    } else {
      currentWindow.on('enter-full-screen', this.handlePlaceholderWindowStateChanged)
      currentWindow.on('leave-full-screen', this.handlePlaceholderWindowStateChanged)
    }
  }

  componentWillUnmount () {
    const currentWindow = remote.getCurrentWindow()
    if (HAS_WINDOW_CONTROLS) {
      currentWindow.removeListener('maximize', this.handleWindowStateChanged)
      currentWindow.removeListener('unmaximize', this.handleWindowStateChanged)
      currentWindow.removeListener('enter-full-screen', this.handleWindowStateChanged)
      currentWindow.removeListener('leave-full-screen', this.handleWindowStateChanged)
      settingsStore.unlisten(this.settingsChanged)
    } else {
      currentWindow.removeListener('enter-full-screen', this.handlePlaceholderWindowStateChanged)
      currentWindow.removeListener('leave-full-screen', this.handlePlaceholderWindowStateChanged)
    }
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    const currentWindow = remote.getCurrentWindow()
    if (HAS_WINDOW_CONTROLS) {
      return {
        isMaximized: currentWindow.isMaximized(),
        isFullScreen: currentWindow.isFullScreen(),
        sidebarSize: settingsStore.getState().ui.sidebarSize
      }
    } else {
      return {
        isFullScreen: currentWindow.isFullScreen()
      }
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      sidebarSize: settingsState.ui.sidebarSize
    })
  }

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

  handlePlaceholderWindowStateChanged = () => {
    const currentWindow = remote.getCurrentWindow()
    this.setState({
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
    const { className, classes, theme, ...passProps } = this.props

    if (HAS_WINDOW_CONTROLS) {
      const {
        sidebarSize,
        isMaximized,
        isFullScreen
      } = this.state
      return (
        <div className={classNames(classes.container, 'WB-SidelistWindowControls', className)} {...passProps}>
          <SidelistWindowControl
            type={SidelistWindowControl.TYPES.CLOSE}
            sidebarSize={sidebarSize}
            onClick={this.handleClose} />
          {isFullScreen || isMaximized ? (
            <SidelistWindowControl
              type={isFullScreen ? SidelistWindowControl.TYPES.UNFULLSCREEN : SidelistWindowControl.TYPES.RESTORE}
              sidebarSize={sidebarSize}
              onClick={this.handleUnmaximize} />
          ) : (
            <SidelistWindowControl
              type={SidelistWindowControl.TYPES.MAXIMIZE}
              sidebarSize={sidebarSize}
              onClick={this.handleMaximize} />
          )}
          <SidelistWindowControl
            type={SidelistWindowControl.TYPES.MINIMIZE}
            sidebarSize={sidebarSize}
            onClick={this.handleMinimize} />
        </div>
      )
    } else {
      const { isFullScreen } = this.state
      return (
        <div className={classNames(
          classes.placeholder,
          process.platform,
          isFullScreen ? 'fullscreen' : undefined,
          className
        )} {...passProps} />
      )
    }
  }
}

export default SidelistWindowControls
