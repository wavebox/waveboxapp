import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControl from './SidelistWindowControl'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { settingsStore } from 'stores/settings'
import ThemeTools from 'wbui/Themes/ThemeTools'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
    if (HAS_WINDOW_CONTROLS) {
      WBRPCRenderer.browserWindow.on('maximize', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.on('unmaximize', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.on('enter-full-screen', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.on('leave-full-screen', this.handleWindowStateChanged)
      settingsStore.listen(this.settingsChanged)
    } else {
      WBRPCRenderer.browserWindow.on('enter-full-screen', this.handlePlaceholderWindowStateChanged)
      WBRPCRenderer.browserWindow.on('leave-full-screen', this.handlePlaceholderWindowStateChanged)
    }
  }

  componentWillUnmount () {
    if (HAS_WINDOW_CONTROLS) {
      WBRPCRenderer.browserWindow.removeListener('maximize', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.removeListener('unmaximize', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.removeListener('enter-full-screen', this.handleWindowStateChanged)
      WBRPCRenderer.browserWindow.removeListener('leave-full-screen', this.handleWindowStateChanged)
      settingsStore.unlisten(this.settingsChanged)
    } else {
      WBRPCRenderer.browserWindow.removeListener('enter-full-screen', this.handlePlaceholderWindowStateChanged)
      WBRPCRenderer.browserWindow.removeListener('leave-full-screen', this.handlePlaceholderWindowStateChanged)
    }
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    if (HAS_WINDOW_CONTROLS) {
      return {
        isMaximized: WBRPCRenderer.browserWindow.isMaximizedSync(),
        isFullScreen: WBRPCRenderer.browserWindow.isFullScreenSync(),
        sidebarSize: settingsStore.getState().ui.sidebarSize
      }
    } else {
      return {
        isFullScreen: WBRPCRenderer.browserWindow.isFullScreenSync()
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
    this.setState({
      isMaximized: WBRPCRenderer.browserWindow.isMaximizedSync(),
      isFullScreen: WBRPCRenderer.browserWindow.isFullScreenSync()
    })
  }

  handlePlaceholderWindowStateChanged = () => {
    this.setState({
      isFullScreen: WBRPCRenderer.browserWindow.isFullScreenSync()
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
    WBRPCRenderer.browserWindow.close()
  }

  /**
  * Minimizes the current window
  * @param evt: the event that fired
  */
  handleMinimize = (evt) => {
    if (WBRPCRenderer.browserWindow.isFullScreenSync()) {
      WBRPCRenderer.browserWindow.setFullScreen(false)
    }
    WBRPCRenderer.browserWindow.minimize()
  }

  /**
  * Maximizes the current window
  * @param evt: the event that fired
  */
  handleMaximize = (evt) => {
    WBRPCRenderer.browserWindow.maximize()
  }

  /**
  * Restores the current window
  * @param evt: the event that fired
  */
  handleUnmaximize = (evt) => {
    if (WBRPCRenderer.browserWindow.isFullScreenSync()) {
      WBRPCRenderer.browserWindow.setFullScreen(false)
    }
    WBRPCRenderer.browserWindow.unmaximize()
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
