import React from 'react'
import { ipcRenderer } from 'electron'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog } from '@material-ui/core'
import ULinkORSceneContent from './ULinkORSceneContent'
import {
  WB_ULINKOR_ASK,
  WB_ULINKOR_CANCEL
} from 'shared/ipcEvents'

class ULinkORScene extends React.Component {
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
    componentProps: undefined,
    open: false
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
  * @param maxAge: the max age of the request
  */
  _handleIPCAskUser = (evt, requestId, webContentsId, serviceId, targetUrl, maxAge) => {
    clearTimeout(this.maxAgeTO)
    this.setState({
      requestId,
      componentProps: {
        webContentsId,
        serviceId,
        targetUrl
      }
    }, () => {
      this.setState({ open: true })
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
    this.setState({ open: false })
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
    const {
      componentProps,
      requestId,
      open
    } = this.state

    return (
      <Dialog
        disableEnforceFocus
        disableRestoreFocus
        open={open}
        onExited={this.handleExited}
        onClose={this.handleClose}>
        {componentProps ? (
          <ULinkORSceneContent
            requestId={requestId}
            onRequestClose={this.handleClose}
            {...componentProps} />
        ) : <div />}
      </Dialog>
    )
  }
}

export default ULinkORScene
