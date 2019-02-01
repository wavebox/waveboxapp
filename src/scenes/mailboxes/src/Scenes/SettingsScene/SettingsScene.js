import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import SettingsSceneContent from './SettingsSceneContent'
import { ipcRenderer } from 'electron'
import {
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT,
  WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER
} from 'shared/ipcEvents'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class SettingsScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.handleIPCOpen)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, this.handleIPCOpenAccount)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.handleIPCOpenSupport)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.handleIPCOpen)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, this.handleIPCOpenAccount)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.handleIPCOpenSupport)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleIPCOpen = () => {
    window.location.hash = '/settings'
  }

  handleIPCOpenAccount = () => {
    window.location.hash = '/settings/pro'
  }

  handleIPCOpenSupport = () => {
    window.location.hash = '/settings/support'
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={SettingsSceneContent} />
      </RouterDialog>
    )
  }
}

export default SettingsScene
