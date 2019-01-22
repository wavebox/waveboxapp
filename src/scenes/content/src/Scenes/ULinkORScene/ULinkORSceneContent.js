import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import { ipcRenderer } from 'electron'
import Resolver from 'Runtime/Resolver'
import {
  WB_ULINKOR_SYSTEM_BROWSER,
  WB_ULINKOR_WAVEBOX_WINDOW,
  WB_ULINKOR_CANCEL
} from 'shared/ipcEvents'
import {
  WCRPC_OPEN_URL_IN_TOP_LEVEL_SERVICE
} from 'shared/webContentsRPC'
import {
  ULinkORDialogTitle,
  ULinkORDialogContent
} from 'wbui/ULinkOR'

class ULinkORSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    requestId: PropTypes.string.isRequired,
    webContentsId: PropTypes.number.isRequired,
    serviceId: PropTypes.string,
    targetUrl: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
    this.props.onRequestClose()
  }

  /**
  * Opens the link in a Wavebox window
  * @param evt: the event that fired
  * @param always: true to make this the default option
  */
  handleOpenInWaveboxWindow = (evt, always) => {
    ipcRenderer.send(WB_ULINKOR_WAVEBOX_WINDOW, this.props.requestId)
    if (always) {
      this.handlePersistOpenerMode(ACMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX)
    }
    this.handleClose()
  }

  /**
  * Opens the link in the system browser
  * @param evt: the event that fired
  * @param always: true to make this the default option
  */
  handleOpenInSystemBrowser = (evt, always) => {
    ipcRenderer.send(WB_ULINKOR_SYSTEM_BROWSER, this.props.requestId)
    if (always) {
      this.handlePersistOpenerMode(ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER)
    }
    this.handleClose()
  }

  /**
  * Opens in a service
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleOpenInService = (evt, serviceId) => {
    ipcRenderer.send(WB_ULINKOR_CANCEL, this.props.requestId)
    ipcRenderer.send(WCRPC_OPEN_URL_IN_TOP_LEVEL_SERVICE, serviceId, this.props.targetUrl)
    this.handleClose()
  }

  /**
  * Persists the given mode to the account
  * @param mode: the mode to use
  */
  handlePersistOpenerMode = (mode) => {
    const { serviceId } = this.props
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }
    accountActions.reduceMailbox(
      service.parentId,
      MailboxReducer.setDefaultWindowOpenMode,
      mode
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      webContentsId,
      serviceId,
      targetUrl
    } = this.props

    return (
      <React.Fragment>
        <ULinkORDialogTitle targetUrl={targetUrl} />
        <ULinkORDialogContent
          serviceId={serviceId}
          webContentsId={webContentsId}
          targetUrl={targetUrl}
          onRequestClose={this.handleClose}
          onOpenInWaveboxWindow={this.handleOpenInWaveboxWindow}
          onOpenInSystemBrowser={this.handleOpenInSystemBrowser}
          onOpenInService={this.handleOpenInService}
          accountStore={accountStore}
          avatarResolver={(i) => Resolver.image(i)}
          iconResolver={(i) => Resolver.icon(i)} />
      </React.Fragment>
    )
  }
}

export default ULinkORSceneContent
