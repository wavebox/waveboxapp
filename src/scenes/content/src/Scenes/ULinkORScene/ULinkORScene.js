import PropTypes from 'prop-types'
import React from 'react'
import { ipcRenderer } from 'electron'
import shallowCompare from 'react-addons-shallow-compare'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import ULinkORSceneContent from './ULinkORSceneContent'
import { withStyles } from '@material-ui/core/styles'
import {
  WB_ULINKOR_ASK,
  WB_ULINKOR_CANCEL
} from 'shared/ipcEvents'

const styles = {
  root: {
    height: '100%',
    width: 600
  }
}

@withStyles(styles)
class ULinkORScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.maxAgeTO = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_ULINKOR_ASK, this._handleIPCAskUser)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_ULINKOR_ASK, this._handleIPCAskUser)
    clearTimeout(this.maxAgeTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    requestId: undefined,
    componentProps: undefined
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles the ipc channel asking the user
  * @param evt: the event that fired
  * @param requestId: the id of the request
  * @param webContentsId: the id of the webcontents
  * @param serviceId: the id of the service
  * @param targetUrl: the url we're trying to open
  * @param isCommandTrigger: true if this was triggered from a command
  * @param maxAge: the max age of the request
  */
  _handleIPCAskUser = (evt, requestId, webContentsId, serviceId, targetUrl, isCommandTrigger, maxAge) => {
    clearTimeout(this.maxAgeTO)
    this.setState({
      requestId: requestId,
      componentProps: {
        webContentsId,
        serviceId,
        targetUrl,
        isCommandTrigger
      }
    }, () => {
      window.location.hash = `/link/open/${requestId}`
      clearTimeout(this.maxAgeTO)
      this.maxAgeTO = setTimeout(this.handleClose, maxAge)
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /**
  * Clears the state ready for the next run
  */
  handleExited = () => {
    ipcRenderer.send(WB_ULINKOR_CANCEL, this.state.requestId)
    this.setState({
      componentProps: undefined,
      requestId: undefined
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { routeName, classes } = this.props
    const { componentProps } = this.state

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        disableRestoreFocus
        onExited={this.handleExited}
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider
          routeName={routeName}
          match
          Component={ULinkORSceneContent}
          {...componentProps} />
      </RouterDialog>
    )
  }
}

export default ULinkORScene
