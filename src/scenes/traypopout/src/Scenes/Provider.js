import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { MuiThemeProvider } from '@material-ui/core/styles'
import MaterialThemeOnly from 'wbui/Themes/MaterialThemeOnly'
import AppScene from './AppScene'
import { ipcRenderer } from 'electron'
import { WB_TRAY_WINDOWED_MODE_CHANGED } from 'shared/ipcEvents'
import WBRPCRenderer from 'shared/WBRPCRenderer'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * See @Thomas101
  * Browser APIs really aren't setup to allow the window to be moved from an action (e.g. click).
  * This means that if a window is moved with the mouse inside it or an element pre-focused
  * the element behavies unexpectedly. A prime example is that the tooltips remain active
  * after the window has moved/shown/hidden. To prevent this when we change the window mode
  * blur the active element and also tell the browser we moved the mouse top-left.
  *
  * This works fine at the moment, but may need to be more complex if we introduce input fields
  * for example.
  */
  handleWindowedModeChanged = (evt) => {
    document.activeElement.blur()
    WBRPCRenderer.webContents.sendInputEvent({
      type: 'mousemove',
      x: 0,
      y: 0
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <MuiThemeProvider theme={MaterialThemeOnly}>
        <AppScene />
      </MuiThemeProvider>
    )
  }
}
