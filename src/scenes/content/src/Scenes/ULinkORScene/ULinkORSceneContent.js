import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
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
    requestId: PropTypes.string.isRequired,
    webContentsId: PropTypes.number.isRequired,
    serviceId: PropTypes.string,
    targetUrl: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    isCommandTrigger: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the opening of the link
  * @param mode: the mode to open the link with
  * @param serviceTarget: the optional service id to open the link with
  */
  handleOpenLink = (mode, serviceTarget) => {
    ipcRenderer.send(WB_ULINKOR_OPEN, this.props.requestId, mode, serviceTarget)
  }

  /**
  * Handles changing the no match rule
  * @param mode: the mode to open the link with
  * @param serviceTarget: the optional service id to open the link with
  */
  handleChangeMailboxNoMatchRule = (mode, serviceTarget) => {
    const { serviceId } = this.props
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }

    accountActions.reduceMailbox(
      service.parentId,
      MailboxReducer.setUserNoMatchWindowOpenRule,
      mode,
      serviceTarget
    )
  }

  /**
  * Handles adding a match rule
  * @param mode: the mode to open the link with
  * @param serviceTarget: the optional service id to open the link with
  * @param match: the match rule
  */
  handleAddMailboxMatchRule = (mode, serviceTarget, match) => {
    const { serviceId } = this.props
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }

    accountActions.reduceMailbox(
      service.parentId,
      MailboxReducer.addUserWindowOpenRule,
      match,
      mode,
      serviceTarget
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
      isCommandTrigger,
      onRequestClose
    } = this.props

    return (
      <ULinkORDialogContent
        serviceId={serviceId}
        webContentsId={webContentsId}
        targetUrl={targetUrl}
        isCommandTrigger={isCommandTrigger}
        onRequestClose={onRequestClose}
        onOpenLink={this.handleOpenLink}
        onChangeMailboxNoMatchWindowOpenRule={this.handleChangeMailboxNoMatchRule}
        onAddMailboxWindowOpenRule={this.handleAddMailboxMatchRule}
        onOpenInWaveboxWindow={this.handleOpenInWaveboxWindow}
        onOpenInSystemBrowser={this.handleOpenInSystemBrowser}
        onOpenInRunningService={this.handleOpenInRunningService}
        onOpenInServiceWindow={this.handleOpenInServiceWindow}
        accountStore={accountStore}
        avatarResolver={(i) => Resolver.image(i)}
        iconResolver={(i) => Resolver.icon(i)} />
    )
  }
}

export default ULinkORSceneContent
