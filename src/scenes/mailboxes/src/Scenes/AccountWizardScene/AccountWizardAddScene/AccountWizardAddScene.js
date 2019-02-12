import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import AccountWizardAddSceneContent from './AccountWizardAddSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import { ipcRenderer } from 'electron'
import { WB_MAILBOXES_WINDOW_ADD_ACCOUNT } from 'shared/ipcEvents'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class AccountWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.handleIPCOpen)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.handleIPCOpen)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleIPCOpen = () => {
    window.location.hash = '/mailbox_wizard/add'
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
        disableRestoreFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={AccountWizardAddSceneContent} />
      </RouterDialog>
    )
  }
}

export default AccountWizardAddScene
