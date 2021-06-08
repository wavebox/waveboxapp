import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import { ipcRenderer } from 'electron'
import Resolver from 'Runtime/Resolver'
import { WB_ULINKOR_OPEN } from 'shared/ipcEvents'
import ULinkORDialogContent from 'wbui/ULinkOR'

class ULinkORSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        requestId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    webContentsId: PropTypes.number.isRequired,
    serviceId: PropTypes.string,
    targetUrl: PropTypes.string.isRequired,
    isCommandTrigger: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /**
  * Handles the opening of the link
  * @param mode: the mode to open the link with
  * @param serviceTarget: the optional service id to open the link with
  */
  handleOpenLink = (mode, serviceTarget) => {
    ipcRenderer.send(WB_ULINKOR_OPEN, this.props.match.params.requestId, mode, serviceTarget)
  }

  /**
  * Handles changing the no match rule
  * @param mode: the mode to open the link with
  * @param targetInfo: the optional target to open the link with
  */
  handleChangeMailboxNoMatchRule = (mode, targetInfo) => {
    const { serviceId } = this.props
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }

    accountActions.reduceMailbox(
      service.parentId,
      MailboxReducer.setUserNoMatchWindowOpenRule,
      mode,
      targetInfo
    )
  }

  /**
  * Handles adding a match rule
  * @param mode: the mode to open the link with
  * @param targetInfo: the optional target to open the link with
  * @param match: the match rule
  */
  handleAddMailboxMatchRule = (mode, targetInfo, match) => {
    const { serviceId } = this.props
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }

    accountActions.reduceMailbox(
      service.parentId,
      MailboxReducer.addUserWindowOpenRule,
      match,
      mode,
      targetInfo
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
      targetUrl,
      isCommandTrigger
    } = this.props

    return (
      <ULinkORDialogContent
        serviceId={serviceId}
        webContentsId={webContentsId}
        targetUrl={targetUrl}
        isCommandTrigger={isCommandTrigger}
        onRequestClose={this.handleClose}
        onOpenLink={this.handleOpenLink}
        onChangeMailboxNoMatchWindowOpenRule={this.handleChangeMailboxNoMatchRule}
        onAddMailboxWindowOpenRule={this.handleAddMailboxMatchRule}
        onOpenInWaveboxWindow={this.handleOpenInWaveboxWindow}
        onOpenInSystemBrowser={this.handleOpenInSystemBrowser}
        onOpenInRunningService={this.handleOpenInRunningService}
        onOpenInServiceWindow={this.handleOpenInServiceWindow}
        accountStore={accountStore}
        settingsStore={settingsStore}
        avatarResolver={(i) => Resolver.image(i)}
        iconResolver={(i) => Resolver.icon(i)} />
    )
  }
}

export default ULinkORSceneContent
